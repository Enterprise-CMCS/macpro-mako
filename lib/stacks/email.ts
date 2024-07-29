import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import * as path from "path";
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";
import { ISubnet } from "aws-cdk-lib/aws-ec2";
import { CfnEventSourceMapping } from "aws-cdk-lib/aws-lambda";

interface EmailServiceStackProps extends cdk.StackProps {
  project: string;
  stage: string;
  stack: string;
  vpc: cdk.aws_ec2.IVpc;
  applicationEndpoint: string;
  emailIdentityDomain: string;
  emailFromIdentity: string;
  indexNamespace: string;
  emailAddressLookupSecretName: string;
  topicNamespace: string;
  privateSubnets: ISubnet[];
  lambdaSecurityGroupId: string;
  brokerString: string;
  lambdaSecurityGroup: cdk.aws_ec2.SecurityGroup;
}

export class Email extends cdk.NestedStack {
  constructor(scope: Construct, id: string, props: EmailServiceStackProps) {
    super(scope, id, props);

    const {
      project,
      stage,
      stack,
      vpc,
      emailFromIdentity,
      emailIdentityDomain,
      applicationEndpoint,
      topicNamespace,
      indexNamespace,
      emailAddressLookupSecretName,
      brokerString,
      lambdaSecurityGroupId,
      privateSubnets,
      lambdaSecurityGroup,
    } = props;

    // KMS Key for SNS Topic
    const kmsKeyForEmails = new cdk.aws_kms.Key(this, "KmsKeyForEmails", {
      enableKeyRotation: true,
      policy: new cdk.aws_iam.PolicyDocument({
        statements: [
          new cdk.aws_iam.PolicyStatement({
            actions: ["kms:*"],
            principals: [new cdk.aws_iam.AccountRootPrincipal()],
            resources: ["*"],
          }),
          new cdk.aws_iam.PolicyStatement({
            actions: ["kms:GenerateDataKey", "kms:Decrypt"],
            principals: [new cdk.aws_iam.ServicePrincipal("sns.amazonaws.com")],
            resources: ["*"],
          }),
          new cdk.aws_iam.PolicyStatement({
            actions: ["kms:GenerateDataKey", "kms:Decrypt"],
            principals: [new cdk.aws_iam.ServicePrincipal("ses.amazonaws.com")],
            resources: ["*"],
          }),
        ],
      }),
    });

    // SNS Topic for Email Events
    const emailEventTopic = new cdk.aws_sns.Topic(this, "EmailEventTopic", {
      displayName: "Monitoring the sending of emails",
      masterKey: kmsKeyForEmails,
    });

    // Allow SES to publish to the SNS topic
    const snsPublishPolicyStatement = new cdk.aws_iam.PolicyStatement({
      actions: ["sns:Publish"],
      principals: [new cdk.aws_iam.ServicePrincipal("ses.amazonaws.com")],
      resources: [emailEventTopic.topicArn],
      effect: cdk.aws_iam.Effect.ALLOW,
    });
    emailEventTopic.addToResourcePolicy(snsPublishPolicyStatement);
    const snsTopicPolicy = emailEventTopic.node.tryFindChild(
      "Policy",
    ) as cdk.CfnResource;

    // S3 Bucket for storing email event data
    const emailDataBucket = new cdk.aws_s3.Bucket(this, "EmailDataBucket", {
      versioned: true,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    // SES Configuration Set
    const configurationSet = new cdk.aws_ses.CfnConfigurationSet(
      this,
      "ConfigurationSet",
      {
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
      },
    );

    // SES Event Destination for Configuration Set
    const eventDestination =
      new cdk.aws_ses.CfnConfigurationSetEventDestination(
        this,
        "ConfigurationSetEventDestination",
        {
          configurationSetName: configurationSet.name!,
          eventDestination: {
            enabled: true,
            matchingEventTypes: [
              "send",
              "reject",
              "bounce",
              "complaint",
              "delivery",
              "open",
              "click",
              "renderingFailure",
            ],
            snsDestination: {
              topicArn: emailEventTopic.topicArn,
            },
          },
        },
      );

    eventDestination.node.addDependency(snsTopicPolicy);

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
          ],
        }),
      },
    });

    // Lambda Function for Processing Emails
    const processEmailsLambda = new NodejsFunction(
      this,
      "ProcessEmailsLambda",
      {
        functionName: `${project}-${stage}-${stack}-processEmails`,
        depsLockFilePath: path.join(__dirname, "../../bun.lockb"),
        entry: path.join(__dirname, "../lambda/processEmails.ts"),
        handler: "handler",
        runtime: cdk.aws_lambda.Runtime.NODEJS_18_X,
        memorySize: 1024,
        timeout: cdk.Duration.seconds(60),
        role: lambdaRole,
        vpc: vpc,
        vpcSubnets: {
          subnets: privateSubnets,
        },
        securityGroups: [lambdaSecurityGroup],
        environment: {
          EMAIL_IDENTITY: emailFromIdentity,
          CONFIGURATION_SET: configurationSet.name!,
          REGION: cdk.Aws.REGION,
          indexNamespace,
          applicationEndpoint: applicationEndpoint,
          emailAddressLookupSecretName: emailAddressLookupSecretName,
          EMAIL_DATA_BUCKET_NAME: emailDataBucket.bucketName,
        },
      },
    );

    // Grant permissions to the Lambda function to write to the S3 bucket
    emailDataBucket.grantPut(processEmailsLambda);

    // Additional configurations (e.g., Kafka event source mapping)...
    // Example of Kafka Event Source Mapping
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
        ...privateSubnets.slice(0, 3).map((subnet) => ({
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

    // Grant permissions to the Lambda function to send emails using SES
    processEmailsLambda.addToRolePolicy(
      new cdk.aws_iam.PolicyStatement({
        actions: ["ses:SendEmail", "ses:SendRawEmail"],
        resources: [
          `arn:aws:ses:${cdk.Aws.REGION}:${cdk.Aws.ACCOUNT_ID}:identity/${emailIdentityDomain}`,
        ],
      }),
    );
  }
}
