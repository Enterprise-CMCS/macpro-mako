import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import { join } from "path";
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";
import { CfnEventSourceMapping } from "aws-cdk-lib/aws-lambda";
import { commonBundlingOptions } from "../config/bundling-config";
import { DeploymentConfigProperties } from "lib/config/deployment-config";

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

interface EnvironmentConfig {
  memorySize: number;
  timeout: number;
  logRetention: number;
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

    // SES Configuration Set
    new cdk.aws_ses.CfnConfigurationSet(this, "ConfigurationSet", {
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
    });

    const dlq = new cdk.aws_sqs.Queue(this, "DeadLetterQueue", {
      queueName: `${project}-${stage}-${stack}-email-dlq`,
      encryption: cdk.aws_sqs.QueueEncryption.KMS_MANAGED,
      retentionPeriod: cdk.Duration.days(14),
      visibilityTimeout: cdk.Duration.seconds(300),
    });

    // IAM Role for Lambda
    const lambdaRole = new cdk.aws_iam.Role(this, "LambdaExecutionRole", {
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
            new cdk.aws_iam.PolicyStatement({
              effect: cdk.aws_iam.Effect.ALLOW,
              actions: ["ec2:DescribeSecurityGroups", "ec2:DescribeVpcs"],
              resources: ["*"],
            }),
            new cdk.aws_iam.PolicyStatement({
              effect: cdk.aws_iam.Effect.ALLOW,
              actions: ["secretsmanager:DescribeSecret", "secretsmanager:GetSecretValue"],
              resources: [`arn:aws:secretsmanager:${this.region}:${this.account}:secret:*`],
            }),
            new cdk.aws_iam.PolicyStatement({
              effect: cdk.aws_iam.Effect.ALLOW,
              actions: ["cognito-idp:ListUsers"],
              resources: [userPool.userPoolArn],
            }),
            new cdk.aws_iam.PolicyStatement({
              effect: cdk.aws_iam.Effect.DENY,
              actions: ["logs:CreateLogGroup"],
              resources: ["*"],
            }),
            new cdk.aws_iam.PolicyStatement({
              effect: cdk.aws_iam.Effect.ALLOW,
              actions: ["sqs:SendMessage"],
              resources: [dlq.queueArn],
            }),
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
          ],
        }),
      },
    });

    const processEmailsLambda = new NodejsFunction(this, "ProcessEmailsLambda", {
      functionName: `${project}-${stage}-${stack}-processEmails`,
      deadLetterQueue: dlq,
      depsLockFilePath: join(__dirname, "../../bun.lockb"),
      entry: join(__dirname, "../lambda/processEmails.ts"),
      handler: "handler",
      runtime: cdk.aws_lambda.Runtime.NODEJS_18_X,
      memorySize: envConfig[props.isDev ? "dev" : "prod"].memorySize,
      timeout: cdk.Duration.minutes(envConfig[props.isDev ? "dev" : "prod"].timeout),
      role: lambdaRole,
      vpc: vpc,
      vpcSubnets: {
        subnets: privateSubnets,
      },
      logRetention: envConfig[isDev ? "dev" : "prod"].logRetention,
      securityGroups: [lambdaSecurityGroup],
      environment: {
        region: cdk.Stack.of(this).region,
        configurationSetName: `${project}-${stage}-${stack}-email-configuration-set`,
        stage,
        isDev: isDev.toString(),
        indexNamespace,
        osDomain: openSearchDomainEndpoint,
        applicationEndpointUrl,
        emailAddressLookupSecretName,
        userPoolId: userPool.userPoolId,
        DLQ_URL: dlq.queueUrl,
        VPC_ID: vpc.vpcId,
        SECURITY_GROUP_ID: lambdaSecurityGroup.securityGroupId,
      },
      bundling: commonBundlingOptions,
      tracing: cdk.aws_lambda.Tracing.ACTIVE,
    });

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

    new CfnEventSourceMapping(this, "SinkSESTrigger5", {
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
      topics: [`${topicNamespace}aws.onemac.migration.cdc`],
      destinationConfig: {
        onFailure: {
          destination: dlq.queueArn,
        },
      },
    });
    
    new CfnEventSourceMapping(this, "SinkSESTrigger6", {
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
      threshold: 1,
      evaluationPeriods: 1,
      alarmDescription: "Email processing lambda errors",
      actionsEnabled: true,
      treatMissingData: cdk.aws_cloudwatch.TreatMissingData.NOT_BREACHING,
    });

    new cdk.aws_cloudwatch.Alarm(this, "EmailLambdaThrottling", {
      metric: processEmailsLambda.metricThrottles(),
      threshold: 1,
      evaluationPeriods: 1,
      alarmDescription: "Email processing lambda is being throttled",
      actionsEnabled: true,
      treatMissingData: cdk.aws_cloudwatch.TreatMissingData.NOT_BREACHING,
    });

    new cdk.aws_cloudwatch.Alarm(this, "EmailDLQMessages", {
      metric: dlq.metricNumberOfMessagesReceived(),
      threshold: 1,
      evaluationPeriods: 1,
      alarmDescription: "Messages are being sent to the DLQ",
      actionsEnabled: true,
      treatMissingData: cdk.aws_cloudwatch.TreatMissingData.NOT_BREACHING,
    });

    processEmailsLambda.node.addDependency(lambdaSecurityGroup);

    new cdk.aws_cloudwatch.Alarm(this, "SESSendQuotaAlarm", {
      metric: new cdk.aws_cloudwatch.Metric({
        namespace: "AWS/SES",
        metricName: "Daily24HourSend",
        statistic: "Sum",
        period: cdk.Duration.hours(24),
      }),
      threshold: envConfig[props.isDev ? "dev" : "prod"].dailySendQuota * 0.8, // 80% of quota
      evaluationPeriods: 1,
      comparisonOperator: cdk.aws_cloudwatch.ComparisonOperator.GREATER_THAN_THRESHOLD,
    });
  }
}
