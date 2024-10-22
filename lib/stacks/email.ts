import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import { join } from "path";
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";
import { ISubnet } from "aws-cdk-lib/aws-ec2";
import { CfnEventSourceMapping } from "aws-cdk-lib/aws-lambda";
import * as dynamodb from "aws-cdk-lib/aws-dynamodb";
import { commonBundlingOptions } from "../config/bundling-config";

interface EmailServiceStackProps extends cdk.StackProps {
  project: string;
  stage: string;
  isDev: boolean;
  stack: string;
  userPoolId: string;
  vpc: cdk.aws_ec2.IVpc;
  applicationEndpointUrl: string;
  indexNamespace: string;
  emailAddressLookupSecretName: string;
  topicNamespace: string;
  privateSubnets: ISubnet[];
  lambdaSecurityGroupId: string;
  brokerString: string;
  lambdaSecurityGroup: cdk.aws_ec2.SecurityGroup;
  openSearchDomainEndpoint: string;
  openSearchDomainArn: string;
  userPool: cdk.aws_cognito.UserPool;
}

export class Email extends cdk.NestedStack {
  constructor(scope: Construct, id: string, props: EmailServiceStackProps) {
    super(scope, id, props);

    const {
      project,
      stage,
      stack,
      userPoolId,
      vpc,
      applicationEndpointUrl,
      topicNamespace,
      indexNamespace,
      emailAddressLookupSecretName,
      brokerString,
      lambdaSecurityGroupId,
      privateSubnets,
      lambdaSecurityGroup,
      openSearchDomainEndpoint,
      openSearchDomainArn,
      userPool,
    } = props;

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
              actions: ["es:ESHttpHead", "es:ESHttpPost", "es:ESHttpGet"],
              resources: [`${openSearchDomainArn}/*`],
            }),
            new cdk.aws_iam.PolicyStatement({
              effect: cdk.aws_iam.Effect.ALLOW,
              actions: ["ec2:DescribeSecurityGroups", "ec2:DescribeVpcs"],
              resources: ["*"],
            }),
            new cdk.aws_iam.PolicyStatement({
              effect: cdk.aws_iam.Effect.ALLOW,
              actions: [
                "secretsmanager:DescribeSecret",
                "secretsmanager:GetSecretValue",
              ],
              resources: [
                `arn:aws:secretsmanager:${this.region}:${this.account}:secret:*`,
              ],
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
          ],
        }),
      },
    });

    // Create a DynamoDB table to track email send attempts
    const emailAttemptsTable = new dynamodb.Table(this, "EmailAttemptsTable", {
      partitionKey: { name: "emailId", type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
    });

    const processEmailsLambda = new NodejsFunction(
      this,
      "ProcessEmailsLambda",
      {
        functionName: `${project}-${stage}-${stack}-processEmails`,
        depsLockFilePath: join(__dirname, "../../bun.lockb"),
        entry: join(__dirname, "../lambda/processEmails.ts"),
        handler: "handler",
        runtime: cdk.aws_lambda.Runtime.NODEJS_18_X,
        memorySize: 1024,
        timeout: cdk.Duration.minutes(15),
        role: lambdaRole,
        vpc: vpc,
        vpcSubnets: {
          subnets: privateSubnets,
        },
        logRetention: 30,
        securityGroups: [lambdaSecurityGroup],
        environment: {
          region: this.region,
          stage,
          indexNamespace,
          osDomain: `https://${openSearchDomainEndpoint}`,
          applicationEndpointUrl,
          emailAddressLookupSecretName,
          EMAIL_ATTEMPTS_TABLE: emailAttemptsTable.tableName,
          MAX_RETRY_ATTEMPTS: "3", // Set the maximum number of retry attempts
          userPoolId,
        },
        bundling: commonBundlingOptions,
      },
    );

    // Grant the Lambda function read/write permissions
    emailAttemptsTable.grantReadWriteData(processEmailsLambda);

    new CfnEventSourceMapping(this, "SinkEmailTrigger", {
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
          uri: `security_group:${lambdaSecurityGroupId}`,
        },
      ],
      startingPosition: "LATEST",
      topics: [`${topicNamespace}aws.onemac.migration.cdc`],
    });
  }
}
