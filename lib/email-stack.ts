import * as cdk from "aws-cdk-lib";
import * as path from "path";
import { Duration } from "aws-cdk-lib";
import {
  Role,
  ServicePrincipal,
  ManagedPolicy,
  PolicyDocument,
  PolicyStatement,
  Effect,
} from "aws-cdk-lib/aws-iam";
import { CfnTopic, CfnTopicPolicy, CfnSubscription } from "aws-cdk-lib/aws-sns";
import {
  CfnConfigurationSet,
  CfnConfigurationSetEventDestination,
} from "aws-cdk-lib/aws-ses";
import { Runtime, Code, CfnEventSourceMapping } from "aws-cdk-lib/aws-lambda";
import { ISubnet, IVpc, SecurityGroup } from "aws-cdk-lib/aws-ec2";
import { Construct } from "constructs";
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";
import { LogGroup } from "aws-cdk-lib/aws-logs";
import { join } from "path";

interface EmailServiceStackProps extends cdk.NestedStackProps {
  project: string;
  stage: string;
  vpc: IVpc;
  privateSubnets: ISubnet[];
  brokerString: string;
  topicNamespace: string;
  osDomainArn: string;
  lambdaSecurityGroupId: string;
  applicationEndpoint: string;
  stack: string;
  cognitoUserPoolId: string;
  emailAddressLookupSecretName: string;
}

export class EmailStack extends cdk.NestedStack {
  constructor(scope: Construct, id: string, props: EmailServiceStackProps) {
    super(scope, id, props);

    const {
      project,
      stage,
      stack,
      vpc,
      privateSubnets,
      brokerString,
      topicNamespace,
      osDomainArn,
      lambdaSecurityGroupId,
      applicationEndpoint,
      cognitoUserPoolId,
      emailAddressLookupSecretName,
    } = props;

    // IAM Role for Lambda
    const lambdaRole = new Role(this, "LambdaExecutionRole", {
      assumedBy: new ServicePrincipal("lambda.amazonaws.com"),
      managedPolicies: [
        ManagedPolicy.fromAwsManagedPolicyName(
          "service-role/AWSLambdaBasicExecutionRole",
        ),
        ManagedPolicy.fromAwsManagedPolicyName(
          "service-role/AWSLambdaVPCAccessExecutionRole",
        ),
      ],
      inlinePolicies: {
        EmailServicePolicy: new PolicyDocument({
          statements: [
            new PolicyStatement({
              effect: Effect.ALLOW,
              actions: [
                "sts:AssumeRole",
                "ses:ListIdentities",
                "ses:ListConfigurationSets",
                "ses:SendTemplatedEmail",
                "sns:Subscribe",
                "sns:Publish",
                "ec2:CreateNetworkInterface",
                "ec2:DescribeNetworkInterfaces",
                "ec2:DescribeVpcs",
                "ec2:DeleteNetworkInterface",
                "ec2:DescribeSubnets",
                "ec2:DescribeSecurityGroups",
                "es:ESHttpGet",
                "cognito-idp:ListUsers",
                "secretsmanager:GetSecretValue",
              ],
              resources: ["*"],
            }),
          ],
        }),
      },
    });

    // SNS Topic
    const emailEventTopic = new CfnTopic(this, "EmailEventTopic", {
      topicName: `${topicNamespace}-email-events`,
      displayName: "Monitoring the sending of emails",
    });

    // KMS Key for SNS Topic
    const kmsKeyForEmails = new cdk.aws_kms.Key(this, "KmsKeyForEmails", {
      enableKeyRotation: true,
      policy: new PolicyDocument({
        statements: [
          new PolicyStatement({
            sid: "Allow access for Root User",
            effect: Effect.ALLOW,
            principals: [new cdk.aws_iam.AccountRootPrincipal()],
            actions: ["kms:*"],
            resources: ["*"],
          }),
          new PolicyStatement({
            sid: "Allow access for Key User (SNS Service Principal)",
            effect: Effect.ALLOW,
            principals: [new ServicePrincipal("sns.amazonaws.com")],
            actions: ["kms:GenerateDataKey", "kms:Decrypt"],
            resources: ["*"],
          }),
          new PolicyStatement({
            sid: "Allow CloudWatch events to use the key",
            effect: Effect.ALLOW,
            principals: [new ServicePrincipal("events.amazonaws.com")],
            actions: ["kms:Decrypt", "kms:GenerateDataKey"],
            resources: ["*"],
          }),
          new PolicyStatement({
            sid: "Allow CloudWatch for CMK",
            effect: Effect.ALLOW,
            principals: [new ServicePrincipal("cloudwatch.amazonaws.com")],
            actions: ["kms:Decrypt", "kms:GenerateDataKey*"],
            resources: ["*"],
          }),
          new PolicyStatement({
            sid: "Allow SES events to use the key",
            effect: Effect.ALLOW,
            principals: [new ServicePrincipal("ses.amazonaws.com")],
            actions: ["kms:Decrypt", "kms:GenerateDataKey*"],
            resources: ["*"],
          }),
        ],
      }),
    });

    // SNS Topic Policy
    new CfnTopicPolicy(this, "EmailEventTopicPolicy", {
      topics: [emailEventTopic.ref],
      policyDocument: {
        Statement: [
          {
            Effect: "Allow",
            Principal: {
              Service: ["lambda.amazonaws.com", "ses.amazonaws.com"],
            },
            Action: ["sns:Subscribe", "sns:Publish"],
            Resource: emailEventTopic.ref,
          },
        ],
      },
    });

    const processEmailsLogGroup = new LogGroup(this, `processEmailsLogGroup`, {
      logGroupName: `/aws/lambda/${project}-${stage}-${stack}-processEmails`,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    // Lambda Function: ProcessEmails
    const processEmailsLambda = new NodejsFunction(
      this,
      "ProcessEmailsLambdaFunction",
      {
        functionName: `${topicNamespace}-processEmails`,
        runtime: Runtime.NODEJS_18_X,
        depsLockFilePath: join(__dirname, "../bun.lockb"),
        handler: "handler",
        entry: path.join(__dirname, "lambda/processEmails.ts"),
        role: lambdaRole,
        memorySize: 1024,
        timeout: Duration.seconds(60),
        environment: {
          region: cdk.Aws.REGION,
          stage: stage,
          osDomain: osDomainArn,
          cognitoPoolId: cognitoUserPoolId,
          emailConfigSet: `${topicNamespace}-configuration`,
          applicationEndpoint: applicationEndpoint,
          emailAddressLookupSecretName,
        },
        vpc,
        securityGroups: [
          SecurityGroup.fromSecurityGroupId(
            this,
            "LambdaSecurityGroup",
            lambdaSecurityGroupId,
          ),
        ],
        vpcSubnets: {
          subnets: privateSubnets,
        },
        logGroup: processEmailsLogGroup,
        bundling: {
          minify: true,
          sourceMap: true,
        },
      },
    );

    const processEmailEventsLogGroup = new LogGroup(
      this,
      `processEmailEventsLogGroup`,
      {
        logGroupName: `/aws/lambda/${project}-${stage}-${stack}-processEmailEvents`,
        removalPolicy: cdk.RemovalPolicy.DESTROY,
      },
    );

    // Lambda Function: ProcessEmailEvents
    const processEmailEventsLambda = new NodejsFunction(
      this,
      "ProcessEmailEventsLambdaFunction",
      {
        functionName: `${topicNamespace}-processEmailEvents`,
        runtime: Runtime.NODEJS_18_X,
        handler: "main",
        depsLockFilePath: join(__dirname, "../bun.lockb"),
        entry: path.join(__dirname, "lambda/processEmailEvents.ts"),
        role: lambdaRole,
        environment: {
          region: cdk.Aws.REGION,
          stage: stage,
          osDomain: osDomainArn,
          cognitoPoolId: cognitoUserPoolId,
          emailConfigSet: `${topicNamespace}-configuration`,
          applicationEndpoint: applicationEndpoint,
        },
        logGroup: processEmailEventsLogGroup,
        bundling: {
          minify: true,
          sourceMap: true,
        },
      },
    );

    // SNS Subscription
    new CfnSubscription(this, "EmailEventSubscription", {
      topicArn: emailEventTopic.ref,
      protocol: "lambda",
      endpoint: processEmailEventsLambda.functionArn,
    });

    // SES Configuration Set
    const emailEventConfigurationSet = new CfnConfigurationSet(
      this,
      "EmailEventConfigurationSet",
      {
        name: `${topicNamespace}-configuration`,
      },
    );

    // SES Configuration Set Event Destination
    new CfnConfigurationSetEventDestination(
      this,
      "EmailEventConfigurationSetEventDestination",
      {
        configurationSetName: emailEventConfigurationSet.ref,
        eventDestination: {
          enabled: true,
          name: `${topicNamespace}-destination`,
          matchingEventTypes: [
            "send",
            "reject",
            "bounce",
            "complaint",
            "delivery",
            "open",
            "click",
            "renderingFailure",
            "deliveryDelay",
            "subscription",
          ],
          snsDestination: {
            topicArn: emailEventTopic.ref,
          },
        },
      },
    );

    const accessConfigSubnets = privateSubnets
      .slice(0, 3)
      .map((subnet) => ({ type: "VPC_SUBNET", uri: subnet.subnetId }));

    // Lambda Event Source Mapping for Kafka
    new CfnEventSourceMapping(this, "SinkEmailTrigger", {
      batchSize: 10,
      enabled: true,
      selfManagedEventSource: {
        endpoints: {
          kafkaBootstrapServers: brokerString.split(","),
        },
      },
      functionName: processEmailsLambda.functionArn,
      sourceAccessConfigurations: [
        ...accessConfigSubnets,
        {
          type: "VPC_SECURITY_GROUP",
          uri: lambdaSecurityGroupId,
        },
      ],
      startingPosition: "LATEST",
      topics: [`${topicNamespace}aws.onemac.migration.cdc`],
    });
  }
}
