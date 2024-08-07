import { DockerImageCode, DockerImageFunction } from "aws-cdk-lib/aws-lambda";
import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import * as sqs from "aws-cdk-lib/aws-sqs";
import * as s3 from "aws-cdk-lib/aws-s3";
import * as s3n from "aws-cdk-lib/aws-s3-notifications";
import * as logs from "aws-cdk-lib/aws-logs";
import * as iam from "aws-cdk-lib/aws-iam";
import * as kms from "aws-cdk-lib/aws-kms";
import * as lambdaEventSources from "aws-cdk-lib/aws-lambda-event-sources";
import * as destinations from "aws-cdk-lib/aws-lambda-destinations";
import * as cr from "aws-cdk-lib/custom-resources";
import {
  ManagedPolicy,
  PolicyDocument,
  Role,
  ServicePrincipal,
} from "aws-cdk-lib/aws-iam";
import { LambdaFunction } from "aws-cdk-lib/aws-events-targets";
import { Rule, RuleTargetInput, Schedule } from "aws-cdk-lib/aws-events";

interface ClamScanScannerProps {
  readonly fileBucket: s3.Bucket;
}

export class ClamScanScanner extends Construct {
  public readonly clamDefsBucket: s3.Bucket;
  public readonly lambdaRole: iam.Role;

  constructor(scope: Construct, id: string, props: ClamScanScannerProps) {
    super(scope, id);
    const { fileBucket } = props;

    // S3 Bucket
    this.clamDefsBucket = new s3.Bucket(this, `ClamDefsBucket`, {
      versioned: true,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    this.clamDefsBucket.addToResourcePolicy(
      new iam.PolicyStatement({
        effect: iam.Effect.DENY,
        principals: [new iam.AnyPrincipal()],
        actions: ["s3:*"],
        resources: [
          this.clamDefsBucket.bucketArn,
          `${this.clamDefsBucket.bucketArn}/*`,
        ],
        conditions: {
          Bool: { "aws:SecureTransport": "false" },
        },
      }),
    );

    // Create a customer-managed KMS key
    const kmsKey = new kms.Key(this, "NotificationQueueKey", {
      enableKeyRotation: true,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    // Grant SQS and S3 permissions to use the KMS key
    kmsKey.addToResourcePolicy(
      new iam.PolicyStatement({
        effect: iam.Effect.ALLOW,
        principals: [new iam.ServicePrincipal("sqs.amazonaws.com")],
        actions: ["kms:Decrypt", "kms:GenerateDataKey"],
        resources: ["*"],
      }),
    );

    kmsKey.addToResourcePolicy(
      new iam.PolicyStatement({
        effect: iam.Effect.ALLOW,
        principals: [new iam.ServicePrincipal("s3.amazonaws.com")],
        actions: ["kms:Decrypt", "kms:GenerateDataKey"],
        resources: ["*"],
      }),
    );

    // Create SQS queue with customer-managed KMS encryption
    const notificationQueue = new sqs.Queue(this, "NotificationQueue", {
      encryption: sqs.QueueEncryption.KMS,
      encryptionMasterKey: kmsKey,
      visibilityTimeout: cdk.Duration.seconds(90),
    });

    // Add permissions for S3 to send messages to the SQS queue
    notificationQueue.addToResourcePolicy(
      new iam.PolicyStatement({
        effect: iam.Effect.ALLOW,
        principals: [new iam.ServicePrincipal("s3.amazonaws.com")],
        actions: ["sqs:SendMessage"],
        resources: [notificationQueue.queueArn],
        conditions: {
          ArnLike: { "aws:SourceArn": fileBucket.bucketArn },
        },
      }),
    );

    // Add S3 bucket notification to send events to the SQS queue
    fileBucket.addEventNotification(
      s3.EventType.OBJECT_CREATED,
      new s3n.SqsDestination(notificationQueue),
    );

    // Create SQS queues for success and failure destinations with AWS-managed encryption
    const successQueue = new sqs.Queue(this, "SuccessQueue", {
      encryption: sqs.QueueEncryption.KMS_MANAGED,
    });

    const failureQueue = new sqs.Queue(this, "FailureQueue", {
      encryption: sqs.QueueEncryption.KMS_MANAGED,
    });

    // Create IAM role for Lambda with the required S3 permissions
    this.lambdaRole = new Role(this, "LambdaExecutionRole", {
      assumedBy: new ServicePrincipal("lambda.amazonaws.com"),
      managedPolicies: [
        ManagedPolicy.fromAwsManagedPolicyName(
          "service-role/AWSLambdaBasicExecutionRole",
        ),
      ],
      inlinePolicies: {
        LambdaPolicy: new PolicyDocument({
          statements: [
            new iam.PolicyStatement({
              actions: [
                "s3:GetObject",
                "s3:GetObjectTagging",
                "s3:PutObject",
                "s3:PutObjectAcl",
                "s3:PutObjectTagging",
                "s3:PutObjectVersionTagging",
                "s3:DeleteObject",
                "s3:ListBucket",
                "s3:GetBucketPolicy",
                "s3:PutBucketPolicy",
                "s3:ListBucketVersions",
                "s3:DeleteObjectVersion",
                "s3:HeadObject",
              ],
              resources: [
                fileBucket.bucketArn,
                `${fileBucket.bucketArn}/*`,
                this.clamDefsBucket.bucketArn,
                `${this.clamDefsBucket.bucketArn}/*`,
              ],
            }),
            new iam.PolicyStatement({
              effect: iam.Effect.DENY,
              actions: ["logs:CreateLogGroup"],
              resources: ["*"],
            }),
            new iam.PolicyStatement({
              actions: [
                "sqs:ReceiveMessage",
                "sqs:DeleteMessage",
                "sqs:GetQueueAttributes",
              ],
              resources: [notificationQueue.queueArn],
            }),
          ],
        }),
      },
    });

    const clamscanDefsLogGroup = new logs.LogGroup(
      this,
      `${id}ClamDefsLogGroup`,
      {
        removalPolicy: cdk.RemovalPolicy.DESTROY,
      },
    );

    const clamDefsLambda = new DockerImageFunction(this, "ServerlessClamDefs", {
      code: DockerImageCode.fromImageAsset(__dirname, {
        cmd: ["dist/defs.handler"],
      }),
      timeout: cdk.Duration.minutes(1),
      memorySize: 10240,
      role: this.lambdaRole,
      logGroup: clamscanDefsLogGroup,
      onSuccess: new destinations.SqsDestination(successQueue),
      onFailure: new destinations.SqsDestination(failureQueue),
      environment: {
        CLAMAV_BUCKET_NAME: this.clamDefsBucket.bucketName,
        PATH_TO_AV_DEFINITIONS: "lambda/s3-antivirus/av-definitions",
      },
    });

    const clamscanLambdaLogGroup = new logs.LogGroup(
      this,
      `${id}ClamscanLambdaLogGroup`,
      {
        removalPolicy: cdk.RemovalPolicy.DESTROY,
      },
    );

    const clamscanLambda = new DockerImageFunction(this, "ServerlessClamscan", {
      code: DockerImageCode.fromImageAsset(__dirname),
      timeout: cdk.Duration.minutes(1),
      memorySize: 10240,
      role: this.lambdaRole,
      logGroup: clamscanLambdaLogGroup,
      onSuccess: new destinations.SqsDestination(successQueue),
      onFailure: new destinations.SqsDestination(failureQueue),
      environment: {
        CLAMAV_BUCKET_NAME: this.clamDefsBucket.bucketName,
        PATH_TO_AV_DEFINITIONS: "lambda/s3-antivirus/av-definitions",
      },
      reservedConcurrentExecutions: 1,
    });

    // Add the SQS queue as an event source to the Lambda function
    clamscanLambda.addEventSource(
      new lambdaEventSources.SqsEventSource(notificationQueue),
    );

    const rule = new Rule(this, "ClamscanScheduleRule", {
      schedule: Schedule.expression("cron(0/2 0-6,8-23 * * ? *)"),
    });

    // Add Lambda as the target with a custom event payload
    rule.addTarget(
      new LambdaFunction(clamscanLambda, {
        event: RuleTargetInput.fromObject({ keepalive: true }),
      }),
    );

    const invokeClamDefsCustomResourceLogGroup = new logs.LogGroup(
      this,
      "InvokeClamDefsCustomResourceLogGroup",
      {
        removalPolicy: cdk.RemovalPolicy.DESTROY,
      },
    );

    // Create a custom resource provider Lambda to invoke clamDefsLambda
    const invokeClamDefsCustomResource = new cr.AwsCustomResource(
      this,
      "InvokeClamDefsCustomResource",
      {
        onCreate: {
          service: "Lambda",
          action: "invoke",
          parameters: {
            FunctionName: clamDefsLambda.functionName,
            Payload: JSON.stringify({
              RequestType: "Create",
              ResourceProperties: {},
            }),
          },
          physicalResourceId: cr.PhysicalResourceId.of("invoke-clamdefs"),
        },
        logGroup: invokeClamDefsCustomResourceLogGroup,
        policy: cr.AwsCustomResourcePolicy.fromStatements([
          new iam.PolicyStatement({
            actions: ["lambda:InvokeFunction"],
            resources: [clamDefsLambda.functionArn],
          }),
          new iam.PolicyStatement({
            effect: iam.Effect.DENY,
            actions: ["logs:CreateLogGroup"],
            resources: ["*"],
          }),
        ]),
      },
    );
    const policy = invokeClamDefsCustomResource.node.findChild(
      "CustomResourcePolicy",
    );
    invokeClamDefsCustomResource.node.addDependency(policy);
    invokeClamDefsCustomResourceLogGroup.node.addDependency(policy);
  }
}
