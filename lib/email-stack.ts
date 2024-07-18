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
import {
  Function,
  Runtime,
  Code,
  CfnEventSourceMapping,
} from "aws-cdk-lib/aws-lambda";
import { ISubnet, IVpc, SecurityGroup } from "aws-cdk-lib/aws-ec2";
import { Construct } from "constructs";

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
      topicName: `${project}-${stage}-email-events`,
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

    // Lambda Function: ProcessEmails
    const processEmailsLambda = new Function(
      this,
      "ProcessEmailsLambdaFunction",
      {
        functionName: `${project}-${stage}-processEmails`,
        runtime: Runtime.NODEJS_18_X,
        handler: "processEmails.handler",
        code: Code.fromAsset(path.join(__dirname, "lambda")),
        role: lambdaRole,
        memorySize: 1024,
        timeout: Duration.seconds(60),
        environment: {
          region: cdk.Aws.REGION,
          stage: stage,
          osDomain: osDomainArn,
          cognitoPoolId: cognitoUserPoolId,
          emailConfigSet: `${project}-${stage}-configuration`,
          applicationEndpoint: applicationEndpoint,
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
      },
    );

    // Lambda Function: ProcessEmailEvents
    const processEmailEventsLambda = new Function(
      this,
      "ProcessEmailEventsLambdaFunction",
      {
        functionName: `${project}-${stage}-processEmailEvents`,
        runtime: Runtime.NODEJS_18_X,
        handler: "processEmails.handler",
        code: Code.fromAsset(path.join(__dirname, "lambda")),
        role: lambdaRole,
        environment: {
          region: cdk.Aws.REGION,
          stage: stage,
          osDomain: osDomainArn,
          cognitoPoolId: cognitoUserPoolId,
          emailConfigSet: `${project}-${stage}-configuration`,
          applicationEndpoint: applicationEndpoint,
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
        name: `${project}-${stage}-configuration`,
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
          name: `${project}-${stage}-destination`,
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
        { type: "VPC_SUBNET", uri: privateSubnets[0].subnetId },
        { type: "VPC_SUBNET", uri: privateSubnets[1].subnetId },
        { type: "VPC_SUBNET", uri: privateSubnets[2].subnetId },
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
