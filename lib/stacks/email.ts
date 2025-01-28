import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import { join } from "path";
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";
import { CfnEventSourceMapping } from "aws-cdk-lib/aws-lambda";
import { commonBundlingOptions } from "../config/bundling-config";
import { DeploymentConfigProperties } from "lib/config/deployment-config";
import { SqsEventSource } from "aws-cdk-lib/aws-lambda-event-sources";

/**
 * Interface defining the required properties for the Email Service Stack
 */
interface EmailServiceStackProps extends cdk.StackProps {
  project: string;
  stage: string;
  isDev: boolean;
  stack: string;
  vpc: cdk.aws_ec2.IVpc;
  applicationEndpointUrl: string;
  indexNamespace: string;
  emailAddressLookupSecretName: string;
  topicNamespace: string;
  privateSubnets: cdk.aws_ec2.ISubnet[];
  lambdaSecurityGroup: cdk.aws_ec2.ISecurityGroup;
  brokerString: DeploymentConfigProperties["brokerString"];
  openSearchDomainEndpoint: string;
  openSearchDomainArn: string;
  userPool: cdk.aws_cognito.UserPool;
}

/**
 * Configuration interface for environment-specific settings
 */
interface EnvironmentConfig {
  memorySize: number;
  timeout: number; // in minutes
  logRetention: number; // in days
  maxRetryAttempts: number;
  dailySendQuota: number;
}

const envConfig: Record<string, EnvironmentConfig> = {
  dev: {
    memorySize: 2048,
    timeout: 10,
    logRetention: 7,
    maxRetryAttempts: 3,
    dailySendQuota: 1000,
  },
  prod: {
    memorySize: 2048,
    timeout: 10,
    logRetention: 30,
    maxRetryAttempts: 5,
    dailySendQuota: 2000,
  },
};

export class Email extends cdk.NestedStack {
  constructor(scope: Construct, id: string, props: EmailServiceStackProps) {
    super(scope, id, props);

    const {
      project,
      stage,
      stack,
      vpc,
      applicationEndpointUrl,
      topicNamespace,
      indexNamespace,
      lambdaSecurityGroup,
      emailAddressLookupSecretName,
      brokerString,
      privateSubnets,
      openSearchDomainEndpoint,
      openSearchDomainArn,
      userPool,
      isDev,
    } = props;

    if (!brokerString || !brokerString.includes(",")) {
      throw new Error("Invalid broker string format");
    }

    const environmentType = isDev ? "dev" : "prod";

    // -------------------------------------------------------------------------
    // SQS Queues: main (delayed) + DLQ
    // -------------------------------------------------------------------------
    const emailQueue = new cdk.aws_sqs.Queue(this, "EmailQueue", {
      queueName: `${project}-${stage}-${stack}-email-queue`,
      encryption: cdk.aws_sqs.QueueEncryption.KMS_MANAGED,
      deliveryDelay: cdk.Duration.seconds(60),
      visibilityTimeout: cdk.Duration.seconds(720),
    });

    const dlq = new cdk.aws_sqs.Queue(this, "DeadLetterQueue", {
      queueName: `${project}-${stage}-${stack}-email-dlq`,
      encryption: cdk.aws_sqs.QueueEncryption.KMS_MANAGED,
      retentionPeriod: cdk.Duration.days(14),
      visibilityTimeout: cdk.Duration.seconds(300),
    });

    // -------------------------------------------------------------------------
    // IAM Role for both Lambdas
    // -------------------------------------------------------------------------
    const lambdaRole = new cdk.aws_iam.Role(this, "EmailLambdaExecutionRole", {
      assumedBy: new cdk.aws_iam.ServicePrincipal("lambda.amazonaws.com"),
      managedPolicies: [
        cdk.aws_iam.ManagedPolicy.fromAwsManagedPolicyName(
          "service-role/AWSLambdaBasicExecutionRole",
        ),
        cdk.aws_iam.ManagedPolicy.fromAwsManagedPolicyName(
          "service-role/AWSLambdaVPCAccessExecutionRole",
        ),
      ],
      inlinePolicies: {
        EmailServicePolicy: new cdk.aws_iam.PolicyDocument({
          statements: [
            // OpenSearch
            new cdk.aws_iam.PolicyStatement({
              effect: cdk.aws_iam.Effect.ALLOW,
              actions: [
                "es:ESHttpHead",
                "es:ESHttpPost",
                "es:ESHttpGet",
                "es:ESHttpPatch",
                "es:ESHttpDelete",
                "es:ESHttpPut",
              ],
              resources: [`${openSearchDomainArn}/*`],
            }),
            // SES + other
            new cdk.aws_iam.PolicyStatement({
              actions: [
                "ses:SendEmail",
                "ses:SendRawEmail",
                "ses:ListIdentities",
                "ses:ListConfigurationSets",
                "sns:Subscribe",
                "sns:Publish",
                "s3:PutObject",
              ],
              resources: ["*"],
            }),
            // EC2 (VPC networking calls)
            new cdk.aws_iam.PolicyStatement({
              effect: cdk.aws_iam.Effect.ALLOW,
              actions: ["ec2:DescribeSecurityGroups", "ec2:DescribeVpcs"],
              resources: ["*"],
            }),
            // Secrets Manager
            new cdk.aws_iam.PolicyStatement({
              effect: cdk.aws_iam.Effect.ALLOW,
              actions: ["secretsmanager:DescribeSecret", "secretsmanager:GetSecretValue"],
              resources: [`arn:aws:secretsmanager:${this.region}:${this.account}:secret:*`],
            }),
            // Cognito user pool list users
            new cdk.aws_iam.PolicyStatement({
              effect: cdk.aws_iam.Effect.ALLOW,
              actions: ["cognito-idp:ListUsers"],
              resources: [userPool.userPoolArn],
            }),
            // Deny creation of Log Groups if you have them pre-created
            new cdk.aws_iam.PolicyStatement({
              effect: cdk.aws_iam.Effect.DENY,
              actions: ["logs:CreateLogGroup"],
              resources: ["*"],
            }),
            // Permissions to send messages to the DLQ
            new cdk.aws_iam.PolicyStatement({
              effect: cdk.aws_iam.Effect.ALLOW,
              actions: ["sqs:SendMessage"],
              resources: [dlq.queueArn],
            }),
            // VPC ENI permissions
            new cdk.aws_iam.PolicyStatement({
              effect: cdk.aws_iam.Effect.ALLOW,
              actions: [
                "ec2:CreateNetworkInterface",
                "ec2:DescribeNetworkInterfaces",
                "ec2:DeleteNetworkInterface",
                "ec2:AssignPrivateIpAddresses",
                "ec2:UnassignPrivateIpAddresses",
              ],
              resources: ["*"],
            }),
            // Permissions to read/write from the main queue
            new cdk.aws_iam.PolicyStatement({
              effect: cdk.aws_iam.Effect.ALLOW,
              actions: [
                "sqs:SendMessage",
                "sqs:ReceiveMessage",
                "sqs:DeleteMessage",
                "sqs:GetQueueAttributes",
              ],
              resources: [emailQueue.queueArn],
            }),
          ],
        }),
      },
    });

    // -------------------------------------------------------------------------
    // SES ConfigurationSet
    // -------------------------------------------------------------------------
    const emailConfig: cdk.aws_ses.CfnConfigurationSetProps = {
      name: `${project}-${stage}-${stack}-email-configuration-set`,
      reputationOptions: {
        reputationMetricsEnabled: true,
      },
      sendingOptions: {
        sendingEnabled: true,
      },
      suppressionOptions: {
        suppressedReasons: ["BOUNCE", "COMPLAINT"],
      },
    };
    const emailConfigSet = new cdk.aws_ses.CfnConfigurationSet(
      this,
      "ConfigurationSet",
      emailConfig,
    );

    // -------------------------------------------------------------------------
    // Lambda A: Kafka -> SQS
    // -------------------------------------------------------------------------
    const kafkaToSqsLambda = new NodejsFunction(this, "KafkaToSqsLambda", {
      functionName: `${project}-${stage}-${stack}-kafkaToSqs`,
      deadLetterQueue: dlq,
      depsLockFilePath: join(__dirname, "../../bun.lockb"),
      entry: join(__dirname, "../lambda/kafkaToSqs.ts"),
      handler: "handler",
      runtime: cdk.aws_lambda.Runtime.NODEJS_20_X,
      memorySize: envConfig[environmentType].memorySize,
      timeout: cdk.Duration.minutes(envConfig[environmentType].timeout),
      role: lambdaRole,
      vpc,
      vpcSubnets: { subnets: privateSubnets },
      logRetention: envConfig[environmentType].logRetention,
      securityGroups: [lambdaSecurityGroup],
      environment: {
        region: cdk.Stack.of(this).region,
        DELAY_QUEUE_URL: emailQueue.queueUrl,
      },
      bundling: commonBundlingOptions,
      tracing: cdk.aws_lambda.Tracing.ACTIVE,
    });

    // -------------------------------------------------------------------------
    // Lambda B: SQS -> OS -> Email
    // -------------------------------------------------------------------------
    const delayedEmailLambda = new NodejsFunction(this, "DelayedEmailLambda", {
      functionName: `${project}-${stage}-${stack}-delayedEmailProcessor`,
      deadLetterQueue: dlq,
      depsLockFilePath: join(__dirname, "../../bun.lockb"),
      entry: join(__dirname, "../lambda/delayedEmailProcessor.ts"),
      handler: "handler",
      runtime: cdk.aws_lambda.Runtime.NODEJS_20_X,
      memorySize: envConfig[environmentType].memorySize,
      timeout: cdk.Duration.minutes(10),
      role: lambdaRole,
      vpc,
      vpcSubnets: { subnets: privateSubnets },
      logRetention: envConfig[environmentType].logRetention,
      securityGroups: [lambdaSecurityGroup],
      environment: {
        region: cdk.Stack.of(this).region,
        configurationSetName: emailConfigSet.name!,
        stage,
        isDev: isDev.toString(),
        indexNamespace,
        osDomain: openSearchDomainEndpoint,
        applicationEndpointUrl,
        emailAddressLookupSecretName,
        userPoolId: userPool.userPoolId,
        DLQ_URL: dlq.queueUrl,
      },
      bundling: commonBundlingOptions,
      tracing: cdk.aws_lambda.Tracing.ACTIVE,
    });

<<<<<<< HEAD
    // -------------------------------------------------------------------------
    // Event Source Mapping: Kafka -> kafkaToSqsLambda
    // -------------------------------------------------------------------------
    new CfnEventSourceMapping(this, "KafkaToSqsEventSourceMapping", {
=======
    const alarmTopic = new cdk.aws_sns.Topic(this, "EmailErrorAlarmTopic");

    const alarm = new cdk.aws_cloudwatch.Alarm(this, "EmailErrorAlarm", {
      actionsEnabled: true,
      metric: processEmailsLambda.metricErrors(),
      threshold: 1,
      evaluationPeriods: 1,
      alarmDescription: "Email processing lambda errors",
      treatMissingData: cdk.aws_cloudwatch.TreatMissingData.NOT_BREACHING,
    });

    alarm.addAlarmAction(new cdk.aws_cloudwatch_actions.SnsAction(alarmTopic));

    new CfnEventSourceMapping(this, "SinkSESTriggerOnemac", {
>>>>>>> origin
      batchSize: 1,
      enabled: true,
      selfManagedEventSource: {
        endpoints: {
          kafkaBootstrapServers: brokerString.split(","),
        },
      },
      functionName: kafkaToSqsLambda.functionName,
      sourceAccessConfigurations: [
        ...privateSubnets.map((subnet) => ({
          type: "VPC_SUBNET",
          uri: subnet.subnetId,
        })),
        {
          type: "VPC_SECURITY_GROUP",
          uri: `security_group:${lambdaSecurityGroup.securityGroupId}`,
        },
      ],
      startingPosition: "LATEST",
      topics: [`${topicNamespace}aws.onemac.migration.cdc`],
      destinationConfig: {
        onFailure: {
          destination: dlq.queueArn,
        },
      },
    });

<<<<<<< HEAD
    // -------------------------------------------------------------------------
    // SQS Event Source: emailQueue -> delayedEmailLambda
    // -------------------------------------------------------------------------
    emailQueue.grantConsumeMessages(delayedEmailLambda);
    delayedEmailLambda.addEventSource(
      new SqsEventSource(emailQueue, {
        batchSize: 10,
      }),
    );

    // -------------------------------------------------------------------------
    // CloudWatch Alarms & SNS
    // -------------------------------------------------------------------------
    const alarmTopic = new cdk.aws_sns.Topic(this, "EmailErrorAlarmTopic");

    // KafkaToSqs Lambda alarms
    const kafkaErrorsAlarm = new cdk.aws_cloudwatch.Alarm(this, "KafkaToSqsErrors", {
      metric: kafkaToSqsLambda.metricErrors(),
=======
    new CfnEventSourceMapping(this, "SinkSESTriggerSEATool", {
      batchSize: 1,
      enabled: true,
      selfManagedEventSource: {
        endpoints: {
          kafkaBootstrapServers: brokerString.split(","),
        },
      },
      functionName: processEmailsLambda.functionName,
      sourceAccessConfigurations: [
        ...privateSubnets.map((subnet) => ({
          type: "VPC_SUBNET",
          uri: subnet.subnetId,
        })),
        {
          type: "VPC_SECURITY_GROUP",
          uri: `security_group:${lambdaSecurityGroup.securityGroupId}`,
        },
      ],
      startingPosition: "LATEST",
      topics: [`aws.seatool.ksql.onemac.three.agg.State_Plan`],
      destinationConfig: {
        onFailure: {
          destination: dlq.queueArn,
        },
      },
    });

    // Add CloudWatch alarms
    new cdk.aws_cloudwatch.Alarm(this, "EmailProcessingErrors", {
      metric: processEmailsLambda.metricErrors(),
>>>>>>> origin
      threshold: 1,
      evaluationPeriods: 1,
      alarmDescription: "KafkaToSqs lambda errors",
      actionsEnabled: true,
      treatMissingData: cdk.aws_cloudwatch.TreatMissingData.NOT_BREACHING,
    });
    const kafkaThrottlingAlarm = new cdk.aws_cloudwatch.Alarm(this, "KafkaToSqsThrottling", {
      metric: kafkaToSqsLambda.metricThrottles(),
      threshold: 1,
      evaluationPeriods: 1,
      alarmDescription: "KafkaToSqs lambda throttled",
      actionsEnabled: true,
      treatMissingData: cdk.aws_cloudwatch.TreatMissingData.NOT_BREACHING,
    });

    // DelayedEmailLambda alarms
    const delayedEmailErrors = new cdk.aws_cloudwatch.Alarm(this, "DelayedEmailErrors", {
      metric: delayedEmailLambda.metricErrors(),
      threshold: 1,
      evaluationPeriods: 1,
      alarmDescription: "Delayed email processing lambda errors",
      actionsEnabled: true,
      treatMissingData: cdk.aws_cloudwatch.TreatMissingData.NOT_BREACHING,
    });
    const delayedEmailThrottles = new cdk.aws_cloudwatch.Alarm(this, "DelayedEmailThrottling", {
      metric: delayedEmailLambda.metricThrottles(),
      threshold: 1,
      evaluationPeriods: 1,
      alarmDescription: "Delayed email processing lambda is throttled",
      actionsEnabled: true,
      treatMissingData: cdk.aws_cloudwatch.TreatMissingData.NOT_BREACHING,
    });

    // DLQ alarm
    const dlqAlarm = new cdk.aws_cloudwatch.Alarm(this, "EmailDLQMessages", {
      metric: dlq.metricNumberOfMessagesReceived(),
      threshold: 1,
      evaluationPeriods: 1,
      alarmDescription: "Messages are being sent to the DLQ",
      actionsEnabled: true,
      treatMissingData: cdk.aws_cloudwatch.TreatMissingData.NOT_BREACHING,
    });

    // SES Quota alarm
    const sesQuotaAlarm = new cdk.aws_cloudwatch.Alarm(this, "SESSendQuotaAlarm", {
      metric: new cdk.aws_cloudwatch.Metric({
        namespace: "AWS/SES",
        metricName: "Daily24HourSend",
        statistic: "Sum",
        period: cdk.Duration.hours(24),
      }),
      threshold: envConfig[environmentType].dailySendQuota * 0.8, // 80% usage
      evaluationPeriods: 1,
      comparisonOperator: cdk.aws_cloudwatch.ComparisonOperator.GREATER_THAN_THRESHOLD,
    });

    // SNS action
    const snsAction = new cdk.aws_cloudwatch_actions.SnsAction(alarmTopic);

    // Add actions
    kafkaErrorsAlarm.addAlarmAction(snsAction);
    kafkaThrottlingAlarm.addAlarmAction(snsAction);
    delayedEmailErrors.addAlarmAction(snsAction);
    delayedEmailThrottles.addAlarmAction(snsAction);
    dlqAlarm.addAlarmAction(snsAction);
    sesQuotaAlarm.addAlarmAction(snsAction);
  }
}
