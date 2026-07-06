import * as cdk from "aws-cdk-lib";
import { AnyPrincipal, Effect, PolicyStatement } from "aws-cdk-lib/aws-iam";
import { SqsEventSource } from "aws-cdk-lib/aws-lambda-event-sources";
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";
import { BlockPublicAccess, Bucket, BucketEncryption } from "aws-cdk-lib/aws-s3";
import { Construct } from "constructs";
import * as LC from "local-constructs";
import { join } from "path";

import { commonBundlingOptions } from "../config/bundling-config";
import { DeploymentConfigProperties } from "../config/deployment-config";
import {
  getArchiveBaseReadBucket,
  getArchiveOverlayPrefix,
  getEphemeralArchiveOverlayBucket,
  isSharedArchiveStage,
} from "./archive-bucket-routing";
import {
  buildAttachmentArchiveIntegrityNotificationEnvironment,
  buildAttachmentArchiveIntegrityRunEnvironment,
  createAttachmentArchiveIntegrityDailySchedule,
  createAttachmentArchiveIntegrityStateMachine,
} from "./attachment-archive-integrity";
import { createAttachmentArchiveStateMachine } from "./attachment-archive-state-machine";
import {
  getLegacyAttachmentBucketMapParameterName,
  getLegacyAttachmentMirrorBuckets,
  getSharedAttachmentReadBucket,
} from "./legacy-attachment-bucket-map";
import {
  buildSeatoolStatusMismatchReportEnvironment,
  createSeatoolStatusMismatchReportDailySchedule,
} from "./seatool-status-mismatch-report";

interface ApiStackProps extends cdk.NestedStackProps {
  project: string;
  stage: string;
  stack: string;
  isDev: boolean;
  attachmentArchiveRebuildQueue: cdk.aws_sqs.IQueue;
  vpc: cdk.aws_ec2.IVpc;
  privateSubnets: cdk.aws_ec2.ISubnet[];
  lambdaSecurityGroup: cdk.aws_ec2.ISecurityGroup;
  topicNamespace: string;
  indexNamespace: string;
  openSearchDomainArn: string;
  openSearchDomainEndpoint: string;
  alertsTopic: cdk.aws_sns.Topic;
  attachmentsBucket: cdk.aws_s3.Bucket;
  brokerString: DeploymentConfigProperties["brokerString"];
  dbInfoSecretName: DeploymentConfigProperties["dbInfoSecretName"];
  legacyS3AccessRoleArn: DeploymentConfigProperties["legacyS3AccessRoleArn"];
  externalApiAuthSecretArn: DeploymentConfigProperties["externalApiAuthSecretArn"];
  emailAddressLookupSecretName: DeploymentConfigProperties["emailAddressLookupSecretName"];
  notificationSecretName: DeploymentConfigProperties["notificationSecretName"];
  notificationSecretArn: DeploymentConfigProperties["notificationSecretArn"];
}

export class Api extends cdk.NestedStack {
  public readonly apiGateway: cdk.aws_apigateway.RestApi;
  public readonly apiGatewayUrl: string;

  constructor(scope: Construct, id: string, props: ApiStackProps) {
    super(scope, id, props);
    const resources = this.initializeResources(props);
    this.apiGateway = resources.apiGateway;
    this.apiGatewayUrl = `https://${this.apiGateway.restApiId}.execute-api.${this.region}.amazonaws.com/${props.stage}`;
  }

  private initializeResources(props: ApiStackProps): {
    apiGateway: cdk.aws_apigateway.RestApi;
  } {
    const ATTACHMENT_ARCHIVE_HISTORICAL_BACKFILL_PAGES_PER_EXECUTION = 10;
    const { project, stage, isDev, stack, attachmentArchiveRebuildQueue } = props;
    const {
      vpc,
      privateSubnets,
      brokerString,
      legacyS3AccessRoleArn,
      externalApiAuthSecretArn,
      emailAddressLookupSecretName,
      lambdaSecurityGroup,
      topicNamespace,
      indexNamespace,
      openSearchDomainArn,
      openSearchDomainEndpoint,
      alertsTopic,
      attachmentsBucket,
      dbInfoSecretName,
      notificationSecretName,
      notificationSecretArn,
    } = props;

    const topicName = `${topicNamespace}aws.onemac.migration.cdc`;
    const legacyAttachmentBucketMapParameterName = getLegacyAttachmentBucketMapParameterName(
      project,
      stage,
    );
    const legacyAttachmentBucketMap = cdk.aws_ssm.StringParameter.valueForStringParameter(
      this,
      legacyAttachmentBucketMapParameterName,
    );
    const sharedAttachmentReadBucket = getSharedAttachmentReadBucket(project, stage, this.account);
    const legacyMirrorBuckets = getLegacyAttachmentMirrorBuckets(project, stage, this.account);
    const legacyMirrorBucketArns = legacyMirrorBuckets.arns;
    const archiveBaseReadBucket = getArchiveBaseReadBucket(project, stage, this.account);
    const archiveOverlayPrefix = getArchiveOverlayPrefix(stage);
    const sharedEphemeralArchiveOverlayBucket = getEphemeralArchiveOverlayBucket(
      project,
      this.account,
    );
    const usesSharedArchiveOverlay = !isSharedArchiveStage(stage);

    const managedArchiveBucket = usesSharedArchiveOverlay
      ? undefined
      : new Bucket(this, "AttachmentArchiveBucket", {
          bucketName: `${project}-${stage}-attachment-archives-${this.account}`,
          versioned: true,
          encryption: BucketEncryption.S3_MANAGED,
          blockPublicAccess: BlockPublicAccess.BLOCK_ALL,
          removalPolicy: isDev ? cdk.RemovalPolicy.DESTROY : cdk.RemovalPolicy.RETAIN,
          autoDeleteObjects: isDev,
          lifecycleRules: [
            {
              abortIncompleteMultipartUploadAfter: cdk.Duration.days(7),
              expiration: cdk.Duration.days(365),
            },
          ],
        });
    const archiveBucket = managedArchiveBucket
      ? managedArchiveBucket
      : Bucket.fromBucketName(
          this,
          "SharedEphemeralAttachmentArchiveBucket",
          sharedEphemeralArchiveOverlayBucket.name,
        );

    if (managedArchiveBucket) {
      managedArchiveBucket.addToResourcePolicy(
        new PolicyStatement({
          effect: Effect.DENY,
          principals: [new AnyPrincipal()],
          actions: ["s3:*"],
          resources: [managedArchiveBucket.bucketArn, `${managedArchiveBucket.bucketArn}/*`],
          conditions: {
            Bool: { "aws:SecureTransport": "false" },
          },
        }),
      );
    }

    if (stage === "main") {
      const ephemeralArchiveOverlayBucket = new Bucket(
        this,
        "EphemeralAttachmentArchiveOverlayBucket",
        {
          bucketName: sharedEphemeralArchiveOverlayBucket.name,
          versioned: true,
          encryption: BucketEncryption.S3_MANAGED,
          blockPublicAccess: BlockPublicAccess.BLOCK_ALL,
          removalPolicy: cdk.RemovalPolicy.RETAIN,
          lifecycleRules: [
            {
              abortIncompleteMultipartUploadAfter: cdk.Duration.days(7),
              expiration: cdk.Duration.days(365),
            },
          ],
        },
      );

      ephemeralArchiveOverlayBucket.addToResourcePolicy(
        new PolicyStatement({
          effect: Effect.DENY,
          principals: [new AnyPrincipal()],
          actions: ["s3:*"],
          resources: [
            ephemeralArchiveOverlayBucket.bucketArn,
            `${ephemeralArchiveOverlayBucket.bucketArn}/*`,
          ],
          conditions: {
            Bool: { "aws:SecureTransport": "false" },
          },
        }),
      );
    }

    const archiveWriteBucketName = archiveBucket.bucketName;
    const archiveWriteBucketArn = archiveBucket.bucketArn;
    const archiveBaseReadBucketName = archiveBaseReadBucket.name;
    const archiveBaseReadBucketArn = archiveBaseReadBucket.arn;

    // Define IAM role
    const lambdaRole = new cdk.aws_iam.Role(this, "LambdaExecutionRole", {
      assumedBy: new cdk.aws_iam.ServicePrincipal("lambda.amazonaws.com"),
      managedPolicies: [
        cdk.aws_iam.ManagedPolicy.fromAwsManagedPolicyName(
          "service-role/AWSLambdaBasicExecutionRole",
        ),
        cdk.aws_iam.ManagedPolicy.fromAwsManagedPolicyName(
          "service-role/AWSLambdaVPCAccessExecutionRole",
        ),
        cdk.aws_iam.ManagedPolicy.fromAwsManagedPolicyName("CloudWatchLogsFullAccess"),
      ],
      inlinePolicies: {
        LambdaPolicy: new cdk.aws_iam.PolicyDocument({
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
              effect: cdk.aws_iam.Effect.ALLOW,
              actions: ["cognito-idp:GetUser", "cognito-idp:ListUsers"],
              resources: ["*"],
            }),
            new cdk.aws_iam.PolicyStatement({
              effect: cdk.aws_iam.Effect.ALLOW,
              actions: ["sts:AssumeRole"],
              resources: [legacyS3AccessRoleArn],
            }),
            new cdk.aws_iam.PolicyStatement({
              effect: cdk.aws_iam.Effect.ALLOW,
              actions: [
                "s3:PutObject",
                "s3:PutObjectTagging",
                "s3:GetObject",
                "s3:GetObjectTagging",
              ],
              resources: [`${attachmentsBucket.bucketArn}/*`],
            }),
            new cdk.aws_iam.PolicyStatement({
              effect: cdk.aws_iam.Effect.ALLOW,
              actions: ["s3:GetObject", "s3:GetObjectTagging"],
              resources: [`${sharedAttachmentReadBucket.arn}/*`],
            }),
            new cdk.aws_iam.PolicyStatement({
              effect: cdk.aws_iam.Effect.ALLOW,
              actions: ["s3:GetObject", "s3:GetObjectTagging"],
              resources: legacyMirrorBucketArns.map((bucketArn) => `${bucketArn}/*`),
            }),
            new cdk.aws_iam.PolicyStatement({
              effect: cdk.aws_iam.Effect.ALLOW,
              actions: ["s3:GetObject", "s3:PutObject"],
              resources: [`${archiveWriteBucketArn}/*`],
            }),
            new cdk.aws_iam.PolicyStatement({
              effect: cdk.aws_iam.Effect.ALLOW,
              actions: ["s3:ListBucket"],
              resources: [archiveWriteBucketArn],
            }),
            new cdk.aws_iam.PolicyStatement({
              effect: cdk.aws_iam.Effect.ALLOW,
              actions: ["s3:GetObject"],
              resources: [`${archiveBaseReadBucketArn}/*`],
            }),
            new cdk.aws_iam.PolicyStatement({
              effect: cdk.aws_iam.Effect.ALLOW,
              actions: ["secretsmanager:DescribeSecret", "secretsmanager:GetSecretValue"],
              resources: [
                `arn:aws:secretsmanager:${this.region}:${this.account}:secret:${dbInfoSecretName}-*`,
              ],
            }),
            new cdk.aws_iam.PolicyStatement({
              effect: cdk.aws_iam.Effect.ALLOW,
              actions: ["secretsmanager:DescribeSecret", "secretsmanager:GetSecretValue"],
              resources: [
                `arn:aws:secretsmanager:${this.region}:${this.account}:secret:${notificationSecretName}-*`,
              ],
            }),
            new cdk.aws_iam.PolicyStatement({
              effect: cdk.aws_iam.Effect.ALLOW,
              actions: ["secretsmanager:DescribeSecret", "secretsmanager:GetSecretValue"],
              resources: [externalApiAuthSecretArn],
            }),
          ],
        }),
      },
    });

    const externalAttachmentDownloadRole = new cdk.aws_iam.Role(
      this,
      "ExternalAttachmentDownloadRole",
      {
        assumedBy: new cdk.aws_iam.ServicePrincipal("lambda.amazonaws.com"),
        managedPolicies: [
          cdk.aws_iam.ManagedPolicy.fromAwsManagedPolicyName(
            "service-role/AWSLambdaBasicExecutionRole",
          ),
          cdk.aws_iam.ManagedPolicy.fromAwsManagedPolicyName(
            "service-role/AWSLambdaVPCAccessExecutionRole",
          ),
          cdk.aws_iam.ManagedPolicy.fromAwsManagedPolicyName("CloudWatchLogsFullAccess"),
        ],
        inlinePolicies: {
          ExternalAttachmentDownloadPolicy: new cdk.aws_iam.PolicyDocument({
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
                effect: cdk.aws_iam.Effect.ALLOW,
                actions: ["sts:AssumeRole"],
                resources: [legacyS3AccessRoleArn],
              }),
              new cdk.aws_iam.PolicyStatement({
                effect: cdk.aws_iam.Effect.ALLOW,
                actions: ["s3:GetObject"],
                resources: [`${attachmentsBucket.bucketArn}/*`],
              }),
              new cdk.aws_iam.PolicyStatement({
                effect: cdk.aws_iam.Effect.ALLOW,
                actions: ["s3:GetObject"],
                resources: [`${sharedAttachmentReadBucket.arn}/*`],
              }),
              new cdk.aws_iam.PolicyStatement({
                effect: cdk.aws_iam.Effect.ALLOW,
                actions: ["s3:GetObject"],
                resources: legacyMirrorBucketArns.map((bucketArn) => `${bucketArn}/*`),
              }),
              new cdk.aws_iam.PolicyStatement({
                effect: cdk.aws_iam.Effect.ALLOW,
                actions: ["s3:GetObject"],
                resources: [`${archiveWriteBucketArn}/*`],
              }),
              new cdk.aws_iam.PolicyStatement({
                effect: cdk.aws_iam.Effect.ALLOW,
                actions: ["s3:ListBucket"],
                resources: [archiveWriteBucketArn],
              }),
              new cdk.aws_iam.PolicyStatement({
                effect: cdk.aws_iam.Effect.ALLOW,
                actions: ["s3:GetObject"],
                resources: [`${archiveBaseReadBucketArn}/*`],
              }),
              new cdk.aws_iam.PolicyStatement({
                effect: cdk.aws_iam.Effect.ALLOW,
                actions: ["s3:ListBucket"],
                resources: [archiveBaseReadBucketArn],
              }),
              new cdk.aws_iam.PolicyStatement({
                effect: cdk.aws_iam.Effect.ALLOW,
                actions: ["sqs:SendMessage"],
                resources: [attachmentArchiveRebuildQueue.queueArn],
              }),
              new cdk.aws_iam.PolicyStatement({
                effect: cdk.aws_iam.Effect.ALLOW,
                actions: ["states:DescribeExecution"],
                resources: [
                  `arn:aws:states:${this.region}:${this.account}:execution:${project}-${stage}-${stack}-attachment-archive:*`,
                  `arn:aws:states:${this.region}:${this.account}:execution:${project}-${stage}-${stack}-attachment-archive-historical-backfill:*`,
                ],
              }),
              new cdk.aws_iam.PolicyStatement({
                effect: cdk.aws_iam.Effect.ALLOW,
                actions: ["secretsmanager:DescribeSecret", "secretsmanager:GetSecretValue"],
                resources: [externalApiAuthSecretArn],
              }),
            ],
          }),
        },
      },
    );

    const attachmentArchiveRequestRole = new cdk.aws_iam.Role(
      this,
      "AttachmentArchiveRequestRole",
      {
        assumedBy: new cdk.aws_iam.ServicePrincipal("lambda.amazonaws.com"),
        managedPolicies: [
          cdk.aws_iam.ManagedPolicy.fromAwsManagedPolicyName(
            "service-role/AWSLambdaBasicExecutionRole",
          ),
          cdk.aws_iam.ManagedPolicy.fromAwsManagedPolicyName(
            "service-role/AWSLambdaVPCAccessExecutionRole",
          ),
          cdk.aws_iam.ManagedPolicy.fromAwsManagedPolicyName("CloudWatchLogsFullAccess"),
        ],
        inlinePolicies: {
          AttachmentArchiveRequestPolicy: new cdk.aws_iam.PolicyDocument({
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
                effect: cdk.aws_iam.Effect.ALLOW,
                actions: ["cognito-idp:GetUser", "cognito-idp:ListUsers"],
                resources: ["*"],
              }),
              new cdk.aws_iam.PolicyStatement({
                effect: cdk.aws_iam.Effect.ALLOW,
                actions: ["s3:GetObject", "s3:PutObject"],
                resources: [`${archiveWriteBucketArn}/*`],
              }),
              new cdk.aws_iam.PolicyStatement({
                effect: cdk.aws_iam.Effect.ALLOW,
                actions: ["s3:GetObjectTagging"],
                resources: [`${attachmentsBucket.bucketArn}/*`],
              }),
              new cdk.aws_iam.PolicyStatement({
                effect: cdk.aws_iam.Effect.ALLOW,
                actions: ["s3:GetObjectTagging"],
                resources: [`${sharedAttachmentReadBucket.arn}/*`],
              }),
              new cdk.aws_iam.PolicyStatement({
                effect: cdk.aws_iam.Effect.ALLOW,
                actions: ["s3:GetObjectTagging"],
                resources: legacyMirrorBucketArns.map((bucketArn) => `${bucketArn}/*`),
              }),
              new cdk.aws_iam.PolicyStatement({
                effect: cdk.aws_iam.Effect.ALLOW,
                actions: ["s3:ListBucket"],
                resources: [archiveWriteBucketArn],
              }),
              new cdk.aws_iam.PolicyStatement({
                effect: cdk.aws_iam.Effect.ALLOW,
                actions: ["s3:GetObject"],
                resources: [`${archiveBaseReadBucketArn}/*`],
              }),
              new cdk.aws_iam.PolicyStatement({
                effect: cdk.aws_iam.Effect.ALLOW,
                actions: ["s3:ListBucket"],
                resources: [archiveBaseReadBucketArn],
              }),
              new cdk.aws_iam.PolicyStatement({
                effect: cdk.aws_iam.Effect.ALLOW,
                actions: ["sqs:GetQueueAttributes", "sqs:SendMessage"],
                resources: [attachmentArchiveRebuildQueue.queueArn],
              }),
              new cdk.aws_iam.PolicyStatement({
                effect: cdk.aws_iam.Effect.ALLOW,
                actions: ["states:ListExecutions"],
                resources: [
                  `arn:aws:states:${this.region}:${this.account}:stateMachine:${project}-${stage}-${stack}-attachment-archive`,
                  `arn:aws:states:${this.region}:${this.account}:stateMachine:${project}-${stage}-${stack}-attachment-archive-historical-backfill`,
                ],
              }),
              new cdk.aws_iam.PolicyStatement({
                effect: cdk.aws_iam.Effect.ALLOW,
                actions: ["states:DescribeExecution"],
                resources: [
                  `arn:aws:states:${this.region}:${this.account}:execution:${project}-${stage}-${stack}-attachment-archive:*`,
                  `arn:aws:states:${this.region}:${this.account}:execution:${project}-${stage}-${stack}-attachment-archive-historical-backfill:*`,
                ],
              }),
            ],
          }),
        },
      },
    );

    const attachmentArchiveMaintenanceRole = new cdk.aws_iam.Role(
      this,
      "AttachmentArchiveMaintenanceRole",
      {
        assumedBy: new cdk.aws_iam.ServicePrincipal("lambda.amazonaws.com"),
        managedPolicies: [
          cdk.aws_iam.ManagedPolicy.fromAwsManagedPolicyName(
            "service-role/AWSLambdaBasicExecutionRole",
          ),
          cdk.aws_iam.ManagedPolicy.fromAwsManagedPolicyName(
            "service-role/AWSLambdaVPCAccessExecutionRole",
          ),
          cdk.aws_iam.ManagedPolicy.fromAwsManagedPolicyName("CloudWatchLogsFullAccess"),
        ],
        inlinePolicies: {
          AttachmentArchiveMaintenancePolicy: new cdk.aws_iam.PolicyDocument({
            statements: [
              new cdk.aws_iam.PolicyStatement({
                effect: cdk.aws_iam.Effect.ALLOW,
                actions: ["s3:GetObject", "s3:PutObject"],
                resources: [`${archiveWriteBucketArn}/*`],
              }),
              new cdk.aws_iam.PolicyStatement({
                effect: cdk.aws_iam.Effect.ALLOW,
                actions: ["s3:ListBucket"],
                resources: [archiveWriteBucketArn],
              }),
            ],
          }),
        },
      },
    );

    const attachmentArchiveIntegrityRole = new cdk.aws_iam.Role(
      this,
      "AttachmentArchiveIntegrityRole",
      {
        assumedBy: new cdk.aws_iam.ServicePrincipal("lambda.amazonaws.com"),
        managedPolicies: [
          cdk.aws_iam.ManagedPolicy.fromAwsManagedPolicyName(
            "service-role/AWSLambdaBasicExecutionRole",
          ),
          cdk.aws_iam.ManagedPolicy.fromAwsManagedPolicyName(
            "service-role/AWSLambdaVPCAccessExecutionRole",
          ),
          cdk.aws_iam.ManagedPolicy.fromAwsManagedPolicyName("CloudWatchLogsFullAccess"),
        ],
        inlinePolicies: {
          AttachmentArchiveIntegrityPolicy: new cdk.aws_iam.PolicyDocument({
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
                effect: cdk.aws_iam.Effect.ALLOW,
                actions: ["s3:GetObject", "s3:PutObject"],
                resources: [`${archiveWriteBucketArn}/*`],
              }),
              new cdk.aws_iam.PolicyStatement({
                effect: cdk.aws_iam.Effect.ALLOW,
                actions: ["s3:ListBucket"],
                resources: [archiveWriteBucketArn],
              }),
              new cdk.aws_iam.PolicyStatement({
                effect: cdk.aws_iam.Effect.ALLOW,
                actions: ["s3:GetObject"],
                resources: [`${archiveBaseReadBucketArn}/*`],
              }),
              new cdk.aws_iam.PolicyStatement({
                effect: cdk.aws_iam.Effect.ALLOW,
                actions: ["s3:ListBucket"],
                resources: [archiveBaseReadBucketArn],
              }),
            ],
          }),
        },
      },
    );

    const seatoolStatusMismatchReportRole = new cdk.aws_iam.Role(
      this,
      "SeatoolStatusMismatchReportRole",
      {
        assumedBy: new cdk.aws_iam.ServicePrincipal("lambda.amazonaws.com"),
        managedPolicies: [
          cdk.aws_iam.ManagedPolicy.fromAwsManagedPolicyName(
            "service-role/AWSLambdaBasicExecutionRole",
          ),
          cdk.aws_iam.ManagedPolicy.fromAwsManagedPolicyName(
            "service-role/AWSLambdaVPCAccessExecutionRole",
          ),
          cdk.aws_iam.ManagedPolicy.fromAwsManagedPolicyName("CloudWatchLogsFullAccess"),
        ],
        inlinePolicies: {
          SeatoolStatusMismatchReportPolicy: new cdk.aws_iam.PolicyDocument({
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
                effect: cdk.aws_iam.Effect.ALLOW,
                actions: ["s3:GetObject", "s3:PutObject"],
                resources: [`${archiveWriteBucketArn}/*`],
              }),
              new cdk.aws_iam.PolicyStatement({
                effect: cdk.aws_iam.Effect.ALLOW,
                actions: ["s3:ListBucket"],
                resources: [archiveWriteBucketArn],
              }),
              new cdk.aws_iam.PolicyStatement({
                effect: cdk.aws_iam.Effect.ALLOW,
                actions: ["ses:SendRawEmail"],
                resources: ["*"],
              }),
              new cdk.aws_iam.PolicyStatement({
                effect: cdk.aws_iam.Effect.ALLOW,
                actions: ["secretsmanager:DescribeSecret", "secretsmanager:GetSecretValue"],
                resources: [
                  `arn:aws:secretsmanager:${this.region}:${this.account}:secret:${emailAddressLookupSecretName}-*`,
                ],
              }),
            ],
          }),
        },
      },
    );

    const attachmentArchiveIntegrityNotificationRole = new cdk.aws_iam.Role(
      this,
      "AttachmentArchiveIntegrityNotificationRole",
      {
        assumedBy: new cdk.aws_iam.ServicePrincipal("lambda.amazonaws.com"),
        managedPolicies: [
          cdk.aws_iam.ManagedPolicy.fromAwsManagedPolicyName(
            "service-role/AWSLambdaBasicExecutionRole",
          ),
          cdk.aws_iam.ManagedPolicy.fromAwsManagedPolicyName(
            "service-role/AWSLambdaVPCAccessExecutionRole",
          ),
          cdk.aws_iam.ManagedPolicy.fromAwsManagedPolicyName("CloudWatchLogsFullAccess"),
        ],
        inlinePolicies: {
          AttachmentArchiveIntegrityNotificationPolicy: new cdk.aws_iam.PolicyDocument({
            statements: [
              new cdk.aws_iam.PolicyStatement({
                effect: cdk.aws_iam.Effect.ALLOW,
                actions: ["s3:GetObject", "s3:PutObject"],
                resources: [`${archiveWriteBucketArn}/*`],
              }),
              new cdk.aws_iam.PolicyStatement({
                effect: cdk.aws_iam.Effect.ALLOW,
                actions: ["ses:SendRawEmail"],
                resources: ["*"],
              }),
              new cdk.aws_iam.PolicyStatement({
                effect: cdk.aws_iam.Effect.ALLOW,
                actions: ["secretsmanager:DescribeSecret", "secretsmanager:GetSecretValue"],
                resources: [
                  `arn:aws:secretsmanager:${this.region}:${this.account}:secret:${emailAddressLookupSecretName}-*`,
                ],
              }),
            ],
          }),
        },
      },
    );

    // Define Lambda functions
    const createNodeJsLambda = (
      id: string,
      entry: string,
      environment: { [key: string]: string | undefined },
      role?: cdk.aws_iam.IRole,
      vpc?: cdk.aws_ec2.IVpc,
      securityGroup?: cdk.aws_ec2.ISecurityGroup,
      subnets?: cdk.aws_ec2.ISubnet[],
      provisionedConcurrency: number = 0,
      timeoutSeconds: number = 30,
      memorySize: number = 1024,
    ) => {
      // Remove any undefined values from the environment object
      const sanitizedEnvironment: { [key: string]: string } = {};
      for (const key in environment) {
        if (environment[key] !== undefined) {
          sanitizedEnvironment[key] = environment[key] as string;
        }
      }

      const logGroup = new cdk.aws_logs.LogGroup(this, `${id}LogGroup`, {
        logGroupName: `/aws/lambda/${project}-${stage}-${stack}-${id}`,
        removalPolicy: cdk.RemovalPolicy.DESTROY,
      });

      const fn = new NodejsFunction(this, id, {
        runtime: cdk.aws_lambda.Runtime.NODEJS_22_X,
        functionName: `${project}-${stage}-${stack}-${id}`,
        depsLockFilePath: join(__dirname, "../../bun.lockb"),
        entry,
        handler: "handler",
        role: role ?? lambdaRole,
        environment: sanitizedEnvironment,
        timeout: cdk.Duration.seconds(timeoutSeconds),
        memorySize,
        retryAttempts: 0,
        vpc: vpc,
        securityGroups: securityGroup ? [securityGroup] : undefined,
        vpcSubnets: subnets ? { subnets } : undefined,
        logGroup,
        bundling: commonBundlingOptions,
      });

      if (provisionedConcurrency > 0) {
        const version = fn.currentVersion;

        // Configure provisioned concurrency
        new cdk.aws_lambda.Alias(this, `FunctionAlias${id}`, {
          aliasName: "prod",
          version: version,
          provisionedConcurrentExecutions: provisionedConcurrency,
        });
      }
      return fn;
    };

    type LambdaDefinition = {
      id: string;
      entry: string;
      environment: { [key: string]: string | undefined };
      memorySize?: number;
      provisionedConcurrency?: number;
      role?: cdk.aws_iam.IRole;
      timeoutSeconds?: number;
    };

    const lambdaDefinitions: LambdaDefinition[] = [
      {
        id: "getUploadUrl",
        entry: join(__dirname, "../lambda/getUploadUrl.ts"),
        environment: {
          attachmentsBucketName: attachmentsBucket.bucketName,
          attachmentsBucketRegion: this.region,
        },
      },
      {
        id: "search",
        entry: join(__dirname, "../lambda/search.ts"),
        environment: {
          osDomain: `https://${openSearchDomainEndpoint}`,
          indexNamespace,
        },
        provisionedConcurrency: 4,
      },
      {
        id: "getPackageActions",
        entry: join(__dirname, "../lambda/getPackageActions.ts"),
        environment: {
          osDomain: `https://${openSearchDomainEndpoint}`,
          legacyS3AccessRoleArn,
          indexNamespace,
        },
      },
      {
        id: "getAttachmentUrl",
        entry: join(__dirname, "../lambda/getAttachmentUrl.ts"),
        environment: {
          osDomain: `https://${openSearchDomainEndpoint}`,
          legacyS3AccessRoleArn,
          indexNamespace,
          LEGACY_ATTACHMENT_BUCKET_MAP: legacyAttachmentBucketMap,
        },
        provisionedConcurrency: 2,
      },
      {
        id: "externalToken",
        entry: join(__dirname, "../lambda/externalToken.ts"),
        environment: {
          externalApiAuthSecretArn,
        },
      },
      {
        id: "externalAttachmentAuthorizer",
        entry: join(__dirname, "../lambda/externalAttachmentAuthorizer.ts"),
        environment: {
          externalApiAuthSecretArn,
        },
      },
      {
        id: "getExternalAttachmentUrl",
        entry: join(__dirname, "../lambda/getExternalAttachmentUrl.ts"),
        environment: {
          osDomain: `https://${openSearchDomainEndpoint}`,
          legacyS3AccessRoleArn,
          indexNamespace,
          externalApiAuthSecretArn,
          ATTACHMENT_ARCHIVE_BUCKET_NAME: archiveWriteBucketName,
          ATTACHMENT_ARCHIVE_BASE_BUCKET_NAME: archiveBaseReadBucketName,
          ATTACHMENT_ARCHIVE_KEY_PREFIX: archiveOverlayPrefix,
          ATTACHMENT_ARCHIVE_REBUILD_QUEUE_URL: attachmentArchiveRebuildQueue.queueUrl,
        },
        role: externalAttachmentDownloadRole,
      },
      {
        id: "getAttachmentArchive",
        entry: join(__dirname, "../lambda/getAttachmentArchive.ts"),
        environment: {
          osDomain: `https://${openSearchDomainEndpoint}`,
          indexNamespace,
          LEGACY_ATTACHMENT_BUCKET_MAP: legacyAttachmentBucketMap,
          legacyS3AccessRoleArn,
          ATTACHMENT_ARCHIVE_BUCKET_NAME: archiveWriteBucketName,
          ATTACHMENT_ARCHIVE_BASE_BUCKET_NAME: archiveBaseReadBucketName,
          ATTACHMENT_ARCHIVE_KEY_PREFIX: archiveOverlayPrefix,
          ATTACHMENT_ARCHIVE_REBUILD_QUEUE_URL: attachmentArchiveRebuildQueue.queueUrl,
        },
        role: attachmentArchiveRequestRole,
      },
      {
        id: "item",
        entry: join(__dirname, "../lambda/item.ts"),
        environment: {
          osDomain: `https://${openSearchDomainEndpoint}`,
          indexNamespace,
        },
        provisionedConcurrency: 2,
      },
      {
        id: "submit",
        entry: join(__dirname, "../lambda/submit/index.ts"),
        environment: {
          dbInfoSecretName,
          topicName,
          brokerString,
          osDomain: `https://${openSearchDomainEndpoint}`,
          indexNamespace,
        },
        provisionedConcurrency: 2,
      },
      {
        id: "saveDraft",
        entry: join(__dirname, "../lambda/saveDraft.ts"),
        environment: {
          osDomain: `https://${openSearchDomainEndpoint}`,
          indexNamespace,
        },
        provisionedConcurrency: 2,
      },
      {
        id: "deleteDraft",
        entry: join(__dirname, "../lambda/deleteDraft.ts"),
        environment: {
          osDomain: `https://${openSearchDomainEndpoint}`,
          indexNamespace,
        },
        provisionedConcurrency: 2,
      },
      {
        id: "getUserDetails",
        entry: join(__dirname, "../lambda/user-management/getUserDetails.ts"),
        environment: {
          dbInfoSecretName,
          topicName,
          brokerString,
          osDomain: `https://${openSearchDomainEndpoint}`,
          indexNamespace,
        },
        provisionedConcurrency: 2,
      },
      {
        id: "requestBaseCMSAccess",
        entry: join(__dirname, "../lambda/user-management/requestBaseCMSAccess.ts"),
        environment: {
          dbInfoSecretName,
          topicName,
          brokerString,
          osDomain: `https://${openSearchDomainEndpoint}`,
          indexNamespace,
        },
        provisionedConcurrency: 2,
      },
      {
        id: "createUserProfile",
        entry: join(__dirname, "../lambda/user-management/createUserProfile.ts"),
        environment: {
          dbInfoSecretName,
          topicName,
          brokerString,
          osDomain: `https://${openSearchDomainEndpoint}`,
          indexNamespace,
        },
        provisionedConcurrency: 2,
      },
      {
        id: "getUserProfile",
        entry: join(__dirname, "../lambda/user-management/getUserProfile.ts"),
        environment: {
          dbInfoSecretName,
          topicName,
          brokerString,
          osDomain: `https://${openSearchDomainEndpoint}`,
          indexNamespace,
        },
        provisionedConcurrency: 2,
      },
      {
        id: "submitGroupDivision",
        entry: join(__dirname, "../lambda/user-management/submitGroupDivision.ts"),
        environment: {
          dbInfoSecretName,
          topicName,
          brokerString,
          osDomain: `https://${openSearchDomainEndpoint}`,
          indexNamespace,
        },
        provisionedConcurrency: 2,
      },
      {
        id: "updateUserRoles",
        entry: join(__dirname, "../lambda/user-management/updateUserRoles.ts"),
        environment: {
          dbInfoSecretName,
          topicName,
          brokerString,
          osDomain: `https://${openSearchDomainEndpoint}`,
          indexNamespace,
        },
        provisionedConcurrency: 2,
      },
      {
        id: "getRoleRequests",
        entry: join(__dirname, "../lambda/user-management/getRoleRequests.ts"),
        environment: {
          dbInfoSecretName,
          topicName,
          brokerString,
          osDomain: `https://${openSearchDomainEndpoint}`,
          indexNamespace,
        },
        provisionedConcurrency: 2,
      },
      {
        id: "getApprovers",
        entry: join(__dirname, "../lambda/user-management/getApprovers.ts"),
        environment: {
          dbInfoSecretName,
          topicName,
          brokerString,
          osDomain: `https://${openSearchDomainEndpoint}`,
          indexNamespace,
        },
        provisionedConcurrency: 2,
      },
      {
        id: "submitRoleRequests",
        entry: join(__dirname, "../lambda/user-management/submitRoleRequests.ts"),
        environment: {
          dbInfoSecretName,
          topicName,
          brokerString,
          osDomain: `https://${openSearchDomainEndpoint}`,
          indexNamespace,
        },
        provisionedConcurrency: 2,
      },
      {
        id: "getTypes",
        entry: join(__dirname, "../lambda/getTypes.ts"),
        environment: {
          osDomain: `https://${openSearchDomainEndpoint}`,
          indexNamespace,
        },
      },
      {
        id: "getSubTypes",
        entry: join(__dirname, "../lambda/getSubTypes.ts"),
        environment: {
          osDomain: `https://${openSearchDomainEndpoint}`,
          indexNamespace,
        },
      },
      {
        id: "getCpocs",
        entry: join(__dirname, "../lambda/getCpocs.ts"),
        environment: {
          osDomain: `https://${openSearchDomainEndpoint}`,
          indexNamespace,
        },
      },
      {
        id: "itemExists",
        entry: join(__dirname, "../lambda/itemExists.ts"),
        environment: {
          osDomain: `https://${openSearchDomainEndpoint}`,
          indexNamespace,
        },
      },
      {
        id: "forms",
        entry: join(__dirname, "../lambda/getForm.ts"),
        environment: {},
      },
      {
        id: "getAllForms",
        entry: join(__dirname, "../lambda/getAllForms.ts"),
        environment: {},
      },
      {
        id: "updatePackage",
        entry: join(__dirname, "../lambda/update/updatePackage.ts"),
        environment: {
          topicName,
          brokerString,
          osDomain: `https://${openSearchDomainEndpoint}`,
          indexNamespace,
        },
      },
      {
        id: "submitSplitSPA",
        entry: join(__dirname, "../lambda/submit/submitSplitSPA.ts"),
        environment: {
          topicName,
          brokerString,
          osDomain: `https://${openSearchDomainEndpoint}`,
          indexNamespace,
        },
        provisionedConcurrency: 2,
      },
      {
        id: "submitNOSO",
        entry: join(__dirname, "../lambda/update/submitNOSO.ts"),
        environment: {
          dbInfoSecretName,
          topicName,
          brokerString,
          osDomain: `https://${openSearchDomainEndpoint}`,
          indexNamespace,
        },
      },
      {
        id: "getSystemNotifs",
        entry: join(__dirname, "../lambda/getSystemNotifs.ts"),
        environment: {
          notificationSecretName,
          notificationSecretArn,
        },
      },
      {
        id: "checkIdentifierUsage",
        entry: join(__dirname, "../lambda/checkIdentifierUsage.ts"),
        environment: {
          osDomain: `https://${openSearchDomainEndpoint}`,
          indexNamespace,
        },
      },
      {
        id: "markAttachmentArchiveFailed",
        entry: join(__dirname, "../lambda/markAttachmentArchiveFailed.ts"),
        environment: {
          ATTACHMENT_ARCHIVE_BUCKET_NAME: archiveWriteBucketName,
        },
        role: attachmentArchiveMaintenanceRole,
      },
      {
        id: "validateAttachmentArchive",
        entry: join(__dirname, "../lambda/validateAttachmentArchive.ts"),
        environment: {
          ATTACHMENT_ARCHIVE_BUCKET_NAME: archiveWriteBucketName,
        },
        role: attachmentArchiveMaintenanceRole,
      },
      {
        id: "rebuildAttachmentArchives",
        entry: join(__dirname, "../lambda/rebuildAttachmentArchives.ts"),
        environment: {
          osDomain: `https://${openSearchDomainEndpoint}`,
          indexNamespace,
          ATTACHMENT_ARCHIVE_BUCKET_NAME: archiveWriteBucketName,
          ATTACHMENT_ARCHIVE_BASE_BUCKET_NAME: archiveBaseReadBucketName,
          ATTACHMENT_ARCHIVE_KEY_PREFIX: archiveOverlayPrefix,
          ATTACHMENT_ARCHIVE_REBUILD_START_DELAY_MS: "1000",
        },
        role: attachmentArchiveRequestRole,
        timeoutSeconds: 300,
      },
      {
        id: "backfillAttachmentArchives",
        entry: join(__dirname, "../lambda/backfillAttachmentArchives.ts"),
        environment: {
          osDomain: `https://${openSearchDomainEndpoint}`,
          indexNamespace,
          ATTACHMENT_ARCHIVE_BUCKET_NAME: archiveWriteBucketName,
          ATTACHMENT_ARCHIVE_BASE_BUCKET_NAME: archiveBaseReadBucketName,
          ATTACHMENT_ARCHIVE_KEY_PREFIX: archiveOverlayPrefix,
          ATTACHMENT_ARCHIVE_REBUILD_QUEUE_URL: attachmentArchiveRebuildQueue.queueUrl,
        },
        role: attachmentArchiveRequestRole,
        timeoutSeconds: 300,
      },
      {
        id: "attachmentArchiveBackfillStatus",
        entry: join(__dirname, "../lambda/attachmentArchiveBackfillStatus.ts"),
        environment: {
          ATTACHMENT_ARCHIVE_REBUILD_QUEUE_URL: attachmentArchiveRebuildQueue.queueUrl,
        },
        role: attachmentArchiveRequestRole,
        timeoutSeconds: 60,
      },
      {
        id: "auditAttachmentArchives",
        entry: join(__dirname, "../lambda/auditAttachmentArchives.ts"),
        environment: {
          osDomain: `https://${openSearchDomainEndpoint}`,
          indexNamespace,
          ATTACHMENT_ARCHIVE_BUCKET_NAME: archiveWriteBucketName,
          ATTACHMENT_ARCHIVE_BASE_BUCKET_NAME: archiveBaseReadBucketName,
          ATTACHMENT_ARCHIVE_KEY_PREFIX: archiveOverlayPrefix,
        },
        role: attachmentArchiveRequestRole,
        timeoutSeconds: 900,
        memorySize: 2048,
      },
      {
        id: "runAttachmentArchiveIntegrityCheck",
        entry: join(__dirname, "../lambda/runAttachmentArchiveIntegrityCheck.ts"),
        environment: buildAttachmentArchiveIntegrityRunEnvironment({
          stage,
          openSearchDomainEndpoint,
          indexNamespace,
          archiveWriteBucketName,
          archiveBaseReadBucketName,
          archiveOverlayPrefix,
        }),
        role: attachmentArchiveIntegrityRole,
        timeoutSeconds: 900,
        memorySize: 2048,
      },
      {
        id: "runSeatoolStatusMismatchReport",
        entry: join(__dirname, "../lambda/runSeatoolStatusMismatchReport.ts"),
        environment: buildSeatoolStatusMismatchReportEnvironment({
          stage,
          brokerString,
          openSearchDomainEndpoint,
          indexNamespace,
          reportBucketName: archiveWriteBucketName,
          emailAddressLookupSecretName,
        }),
        role: seatoolStatusMismatchReportRole,
        timeoutSeconds: 900,
        memorySize: 2048,
      },
      {
        id: "notifyAttachmentArchiveIntegrity",
        entry: join(__dirname, "../lambda/notifyAttachmentArchiveIntegrity.ts"),
        environment: buildAttachmentArchiveIntegrityNotificationEnvironment({
          stage,
          archiveWriteBucketName,
          emailAddressLookupSecretName,
        }),
        role: attachmentArchiveIntegrityNotificationRole,
        timeoutSeconds: 300,
      },
    ];

    const lambdas = lambdaDefinitions.reduce(
      (acc, lambdaDef) => {
        acc[lambdaDef.id] = createNodeJsLambda(
          lambdaDef.id,
          lambdaDef.entry,
          lambdaDef.environment,
          lambdaDef.role,
          vpc,
          lambdaSecurityGroup,
          privateSubnets,
          !props.isDev ? lambdaDef.provisionedConcurrency : 0,
          lambdaDef.timeoutSeconds,
          lambdaDef.memorySize,
        );
        return acc;
      },
      {} as { [key: string]: NodejsFunction },
    );

    const attachmentArchiveImageCacheBust = "2026-05-13-attachment-archive-security-refresh";

    const archiveWorkerImage = new cdk.aws_ecr_assets.DockerImageAsset(
      this,
      "AttachmentArchiveWorkerImage",
      {
        directory: join(__dirname, "../attachment-archive"),
        platform: cdk.aws_ecr_assets.Platform.LINUX_AMD64,
        buildArgs: {
          CACHE_BUST: attachmentArchiveImageCacheBust,
        },
      },
    );

    const archiveStateMachine = createAttachmentArchiveStateMachine(this, {
      project,
      stage,
      stack,
      vpc,
      privateSubnets,
      lambdaSecurityGroup,
      attachmentsBucketArn: attachmentsBucket.bucketArn,
      sharedAttachmentReadBucketArn: sharedAttachmentReadBucket.arn,
      legacyMirrorBucketArns,
      archiveWriteBucketArn,
      legacyS3AccessRoleArn,
      legacyAttachmentBucketMap,
      archiveWorkerImage: cdk.aws_ecs.ContainerImage.fromDockerImageAsset(archiveWorkerImage),
      markAttachmentArchiveFailedLambda: lambdas.markAttachmentArchiveFailed,
      validateAttachmentArchiveLambda: lambdas.validateAttachmentArchive,
    });

    archiveStateMachine.grantStartExecution(attachmentArchiveRequestRole);
    lambdas.getAttachmentArchive.addEnvironment(
      "ATTACHMENT_ARCHIVE_STATE_MACHINE_ARN",
      archiveStateMachine.stateMachineArn,
    );
    lambdas.rebuildAttachmentArchives.addEnvironment(
      "ATTACHMENT_ARCHIVE_STATE_MACHINE_ARN",
      archiveStateMachine.stateMachineArn,
    );
    lambdas.attachmentArchiveBackfillStatus.addEnvironment(
      "ATTACHMENT_ARCHIVE_STATE_MACHINE_ARN",
      archiveStateMachine.stateMachineArn,
    );
    attachmentArchiveRebuildQueue.grantSendMessages(attachmentArchiveRequestRole);
    lambdas.rebuildAttachmentArchives.addEventSource(
      new SqsEventSource(attachmentArchiveRebuildQueue, {
        batchSize: 1,
        maxConcurrency: 2,
      }),
    );

    const historicalBackfillStateMachineName = `${project}-${stage}-${stack}-attachment-archive-historical-backfill`;
    const historicalBackfillStateMachineArn = `arn:aws:states:${this.region}:${this.account}:stateMachine:${historicalBackfillStateMachineName}`;
    const historicalBackfillStateMachineLogGroup = new cdk.aws_logs.LogGroup(
      this,
      "AttachmentArchiveHistoricalBackfillStateMachineLogGroup",
      {
        logGroupName: `/aws/vendedlogs/states/${project}-${stage}-${stack}-attachment-archive-historical-backfill`,
        removalPolicy: cdk.RemovalPolicy.DESTROY,
      },
    );

    const initializeHistoricalBackfillCursor = new cdk.aws_stepfunctions.Pass(
      this,
      "InitializeAttachmentArchiveHistoricalBackfillCursor",
      {
        result: cdk.aws_stepfunctions.Result.fromObject({
          afterKey: null,
        }),
        resultPath: "$.cursor",
      },
    );

    const initializeHistoricalBackfillPageBudget = new cdk.aws_stepfunctions.Pass(
      this,
      "InitializeAttachmentArchiveHistoricalBackfillPageBudget",
      {
        result: cdk.aws_stepfunctions.Result.fromObject({
          remaining: ATTACHMENT_ARCHIVE_HISTORICAL_BACKFILL_PAGES_PER_EXECUTION,
        }),
        resultPath: "$.pageBudget",
      },
    );

    const decrementHistoricalBackfillPageBudget = new cdk.aws_stepfunctions.Pass(
      this,
      "DecrementAttachmentArchiveHistoricalBackfillPageBudget",
      {
        parameters: {
          remaining: cdk.aws_stepfunctions.JsonPath.mathAdd(
            cdk.aws_stepfunctions.JsonPath.numberAt("$.pageBudget.remaining"),
            -1,
          ),
        },
        resultPath: "$.pageBudget",
      },
    );

    const checkHistoricalBackfillLockTask = new cdk.aws_stepfunctions_tasks.LambdaInvoke(
      this,
      "CheckAttachmentArchiveHistoricalBackfillLockTask",
      {
        lambdaFunction: lambdas.attachmentArchiveBackfillStatus,
        payloadResponseOnly: true,
        payload: cdk.aws_stepfunctions.TaskInput.fromObject({
          "currentExecutionArn.$": "$$.Execution.Id",
          "historicalBackfillStateMachineArn.$": "$$.StateMachine.Id",
        }),
        resultPath: "$.status",
      },
    );

    const checkHistoricalBackfillDrainStatusTask = new cdk.aws_stepfunctions_tasks.LambdaInvoke(
      this,
      "CheckAttachmentArchiveHistoricalBackfillDrainStatusTask",
      {
        lambdaFunction: lambdas.attachmentArchiveBackfillStatus,
        payloadResponseOnly: true,
        payload: cdk.aws_stepfunctions.TaskInput.fromObject({
          "currentExecutionArn.$": "$$.Execution.Id",
          "historicalBackfillStateMachineArn.$": "$$.StateMachine.Id",
        }),
        resultPath: "$.status",
      },
    );

    const enqueueHistoricalBackfillPageTask = new cdk.aws_stepfunctions_tasks.LambdaInvoke(
      this,
      "EnqueueAttachmentArchiveHistoricalBackfillPageTask",
      {
        lambdaFunction: lambdas.backfillAttachmentArchives,
        payloadResponseOnly: true,
        payload: cdk.aws_stepfunctions.TaskInput.fromObject({
          "afterKey.$": "$.cursor.afterKey",
          pageSize: 25,
        }),
        resultPath: "$.page",
      },
    );

    const continueHistoricalBackfillExecutionTask =
      new cdk.aws_stepfunctions_tasks.StepFunctionsStartExecution(
        this,
        "ContinueAttachmentArchiveHistoricalBackfillExecutionTask",
        {
          stateMachine: cdk.aws_stepfunctions.StateMachine.fromStateMachineArn(
            this,
            "AttachmentArchiveHistoricalBackfillStateMachineRef",
            historicalBackfillStateMachineArn,
          ),
          integrationPattern: cdk.aws_stepfunctions.IntegrationPattern.REQUEST_RESPONSE,
          input: cdk.aws_stepfunctions.TaskInput.fromObject({
            cursor: {
              "afterKey.$": "$.page.afterKey",
            },
            pageBudget: {
              remaining: ATTACHMENT_ARCHIVE_HISTORICAL_BACKFILL_PAGES_PER_EXECUTION,
            },
            skipLockCheck: true,
          }),
          resultPath: cdk.aws_stepfunctions.JsonPath.DISCARD,
        },
      );

    const waitForHistoricalBackfillDrain = new cdk.aws_stepfunctions.Wait(
      this,
      "WaitForAttachmentArchiveHistoricalBackfillDrain",
      {
        time: cdk.aws_stepfunctions.WaitTime.duration(cdk.Duration.seconds(60)),
      },
    );

    const advanceHistoricalBackfillCursor = new cdk.aws_stepfunctions.Pass(
      this,
      "AdvanceAttachmentArchiveHistoricalBackfillCursor",
      {
        parameters: {
          "afterKey.$": "$.page.afterKey",
        },
        resultPath: "$.cursor",
      },
    );

    const historicalBackfillAlreadyRunning = new cdk.aws_stepfunctions.Fail(
      this,
      "AttachmentArchiveHistoricalBackfillAlreadyRunning",
      {
        cause: "Another historical attachment archive backfill execution is already running.",
        error: "HistoricalBackfillAlreadyRunning",
      },
    );

    const historicalBackfillComplete = new cdk.aws_stepfunctions.Succeed(
      this,
      "AttachmentArchiveHistoricalBackfillComplete",
    );

    const historicalBackfillContinued = new cdk.aws_stepfunctions.Succeed(
      this,
      "AttachmentArchiveHistoricalBackfillContinued",
    );

    const initializeHistoricalBackfillState = new cdk.aws_stepfunctions.Choice(
      this,
      "InitializeAttachmentArchiveHistoricalBackfillState",
    );

    const ensureHistoricalBackfillPageBudget = new cdk.aws_stepfunctions.Choice(
      this,
      "EnsureAttachmentArchiveHistoricalBackfillPageBudget",
    );

    const shouldSkipHistoricalBackfillLockCheck = new cdk.aws_stepfunctions.Choice(
      this,
      "ShouldSkipAttachmentArchiveHistoricalBackfillLockCheck",
    );

    const ensureSingleHistoricalBackfillExecution = new cdk.aws_stepfunctions.Choice(
      this,
      "EnsureSingleAttachmentArchiveHistoricalBackfillExecution",
    );

    const historicalBackfillDrainChoice = new cdk.aws_stepfunctions.Choice(
      this,
      "AttachmentArchiveHistoricalBackfillDrainChoice",
    );

    initializeHistoricalBackfillState
      .when(
        cdk.aws_stepfunctions.Condition.isPresent("$.cursor.afterKey"),
        ensureHistoricalBackfillPageBudget,
      )
      .otherwise(initializeHistoricalBackfillCursor);
    initializeHistoricalBackfillCursor.next(ensureHistoricalBackfillPageBudget);
    ensureHistoricalBackfillPageBudget
      .when(
        cdk.aws_stepfunctions.Condition.isPresent("$.pageBudget.remaining"),
        shouldSkipHistoricalBackfillLockCheck,
      )
      .otherwise(initializeHistoricalBackfillPageBudget);
    initializeHistoricalBackfillPageBudget.next(shouldSkipHistoricalBackfillLockCheck);
    shouldSkipHistoricalBackfillLockCheck
      .when(
        cdk.aws_stepfunctions.Condition.and(
          cdk.aws_stepfunctions.Condition.isPresent("$.skipLockCheck"),
          cdk.aws_stepfunctions.Condition.booleanEquals("$.skipLockCheck", true),
        ),
        enqueueHistoricalBackfillPageTask,
      )
      .otherwise(checkHistoricalBackfillLockTask);
    ensureSingleHistoricalBackfillExecution
      .when(
        cdk.aws_stepfunctions.Condition.numberGreaterThan(
          "$.status.otherHistoricalBackfillExecutions",
          0,
        ),
        historicalBackfillAlreadyRunning,
      )
      .otherwise(enqueueHistoricalBackfillPageTask);

    checkHistoricalBackfillLockTask.next(ensureSingleHistoricalBackfillExecution);
    enqueueHistoricalBackfillPageTask.next(waitForHistoricalBackfillDrain);
    waitForHistoricalBackfillDrain.next(checkHistoricalBackfillDrainStatusTask);
    historicalBackfillDrainChoice
      .when(
        cdk.aws_stepfunctions.Condition.or(
          cdk.aws_stepfunctions.Condition.numberGreaterThan("$.status.queueVisible", 0),
          cdk.aws_stepfunctions.Condition.numberGreaterThan("$.status.queueInflight", 0),
          cdk.aws_stepfunctions.Condition.numberGreaterThan("$.status.runningExecutions", 0),
        ),
        waitForHistoricalBackfillDrain,
      )
      .when(
        cdk.aws_stepfunctions.Condition.booleanEquals("$.page.done", true),
        historicalBackfillComplete,
      )
      .when(
        cdk.aws_stepfunctions.Condition.numberGreaterThan("$.pageBudget.remaining", 1),
        decrementHistoricalBackfillPageBudget,
      )
      .otherwise(continueHistoricalBackfillExecutionTask);
    checkHistoricalBackfillDrainStatusTask.next(historicalBackfillDrainChoice);
    decrementHistoricalBackfillPageBudget.next(advanceHistoricalBackfillCursor);
    advanceHistoricalBackfillCursor.next(enqueueHistoricalBackfillPageTask);
    continueHistoricalBackfillExecutionTask.next(historicalBackfillContinued);

    new cdk.aws_stepfunctions.StateMachine(
      this,
      "AttachmentArchiveHistoricalBackfillStateMachine",
      {
        definitionBody: cdk.aws_stepfunctions.DefinitionBody.fromChainable(
          initializeHistoricalBackfillState,
        ),
        stateMachineName: historicalBackfillStateMachineName,
        logs: {
          destination: historicalBackfillStateMachineLogGroup,
          includeExecutionData: true,
          level: cdk.aws_stepfunctions.LogLevel.ALL,
        },
        stateMachineType: cdk.aws_stepfunctions.StateMachineType.STANDARD,
      },
    );

    const archiveIntegrityStateMachine = createAttachmentArchiveIntegrityStateMachine(this, {
      project,
      stage,
      stack,
      runAttachmentArchiveIntegrityCheckLambda: lambdas.runAttachmentArchiveIntegrityCheck,
      notifyAttachmentArchiveIntegrityLambda: lambdas.notifyAttachmentArchiveIntegrity,
    });

    createAttachmentArchiveIntegrityDailySchedule(this, {
      project,
      stage,
      stack,
      isDev,
      stateMachine: archiveIntegrityStateMachine,
    });

    createSeatoolStatusMismatchReportDailySchedule(this, {
      project,
      stage,
      stack,
      isDev,
      runSeatoolStatusMismatchReportLambda: lambdas.runSeatoolStatusMismatchReport,
    });

    // Create IAM role for API Gateway to invoke Lambda functions
    const apiGatewayRole = new cdk.aws_iam.Role(this, "ApiGatewayRole", {
      assumedBy: new cdk.aws_iam.ServicePrincipal("apigateway.amazonaws.com"),
      inlinePolicies: {
        InvokeLambdaPolicy: new cdk.aws_iam.PolicyDocument({
          statements: [
            new cdk.aws_iam.PolicyStatement({
              effect: cdk.aws_iam.Effect.ALLOW,
              actions: ["lambda:InvokeFunction"],
              resources: ["arn:aws:lambda:*:*:function:*"],
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

    const apiExecutionLogsLogGroup = new cdk.aws_logs.LogGroup(
      this,
      "ApiGatewayExecutionLogsLogGroup",
      {
        removalPolicy: cdk.RemovalPolicy.DESTROY,
      },
    );

    // Define API Gateway
    const api = new cdk.aws_apigateway.RestApi(this, "APIGateway", {
      restApiName: `${project}-${stage}`,
      deployOptions: {
        stageName: stage,
        loggingLevel: cdk.aws_apigateway.MethodLoggingLevel.INFO,
        dataTraceEnabled: true,
        metricsEnabled: true,
        accessLogDestination: new cdk.aws_apigateway.LogGroupLogDestination(
          apiExecutionLogsLogGroup,
        ),
        accessLogFormat: cdk.aws_apigateway.AccessLogFormat.jsonWithStandardFields({
          caller: true,
          httpMethod: true,
          ip: true,
          protocol: true,
          requestTime: true,
          resourcePath: true,
          responseLength: true,
          status: true,
          user: true,
        }),
      },
      defaultCorsPreflightOptions: {
        allowOrigins: cdk.aws_apigateway.Cors.ALL_ORIGINS,
        allowMethods: cdk.aws_apigateway.Cors.ALL_METHODS,
        allowHeaders: [
          "Content-Type",
          "Authorization",
          "X-Amz-Date",
          "X-Api-Key",
          "X-Amz-Security-Token",
          "X-Amz-User-Agent",
        ],
        allowCredentials: true,
      },
      endpointConfiguration: {
        types: [cdk.aws_apigateway.EndpointType.EDGE],
      },
    });

    // Add GatewayResponse for 4XX errors
    new cdk.aws_apigateway.CfnGatewayResponse(this, "GatewayResponseDefault4XX", {
      restApiId: api.restApiId,
      responseType: "DEFAULT_4XX",
      responseParameters: {
        "gatewayresponse.header.Access-Control-Allow-Origin": "'*'",
        "gatewayresponse.header.Access-Control-Allow-Headers": "'*'",
      },
    });

    // Add GatewayResponse for 5XX errors
    new cdk.aws_apigateway.CfnGatewayResponse(this, "GatewayResponseDefault5XX", {
      restApiId: api.restApiId,
      responseType: "DEFAULT_5XX",
      responseParameters: {
        "gatewayresponse.header.Access-Control-Allow-Origin": "'*'",
        "gatewayresponse.header.Access-Control-Allow-Headers": "'*'",
      },
    });

    const externalTokenAuthorizer = new cdk.aws_apigateway.TokenAuthorizer(
      this,
      "ExternalTokenAuthorizer",
      {
        handler: lambdas.externalAttachmentAuthorizer,
        identitySource: cdk.aws_apigateway.IdentitySource.header("Authorization"),
        resultsCacheTtl: cdk.Duration.minutes(5),
      },
    );

    type RouteAuthorization = "IAM" | "NONE" | "CUSTOM";
    type ApiResourceDefinition = {
      path: string;
      lambda: NodejsFunction;
      method: string;
      authorizationType?: RouteAuthorization;
      authorizer?: cdk.aws_apigateway.IAuthorizer;
    };

    const apiResources: Record<string, ApiResourceDefinition> = {
      search: {
        path: "search/{index}",
        lambda: lambdas.search,
        method: "POST",
      },
      getPackageActions: {
        path: "getPackageActions",
        lambda: lambdas.getPackageActions,
        method: "POST",
      },
      getAttachmentUrl: {
        path: "getAttachmentUrl",
        lambda: lambdas.getAttachmentUrl,
        method: "POST",
      },
      getAttachmentArchive: {
        path: "getAttachmentArchive",
        lambda: lambdas.getAttachmentArchive,
        method: "POST",
      },
      getUploadUrl: {
        path: "getUploadUrl",
        lambda: lambdas.getUploadUrl,
        method: "POST",
      },
      oauthToken: {
        path: "oauth/token",
        lambda: lambdas.externalToken,
        method: "POST",
        authorizationType: "NONE",
      },
      externalGetAttachmentUrl: {
        path: "external/getAttachmentUrl",
        lambda: lambdas.getExternalAttachmentUrl,
        method: "POST",
        authorizationType: "CUSTOM",
        authorizer: externalTokenAuthorizer,
      },
      checkIdentifierUsage: {
        path: "checkIdentifierUsage",
        lambda: lambdas.checkIdentifierUsage,
        method: "GET",
        authorizationType: "IAM",
      },
      requestBaseCMSAccess: {
        path: "requestBaseCMSAccess",
        lambda: lambdas.requestBaseCMSAccess,
        method: "GET",
      },
      createUserProfile: {
        path: "createUserProfile",
        lambda: lambdas.createUserProfile,
        method: "GET",
      },
      getUserDetails: {
        path: "getUserDetails",
        lambda: lambdas.getUserDetails,
        method: "POST",
      },
      getUserProfile: {
        path: "getUserProfile",
        lambda: lambdas.getUserProfile,
        method: "POST",
      },
      getApprovers: {
        path: "getApprovers",
        lambda: lambdas.getApprovers,
        method: "POST",
      },
      submitGroupDivision: {
        path: "submitGroupDivision",
        lambda: lambdas.submitGroupDivision,
        method: "POST",
      },
      updateUserRoles: {
        path: "updateUserRoles",
        lambda: lambdas.updateUserRoles,
        method: "POST",
      },
      getRoleRequests: {
        path: "getRoleRequests",
        lambda: lambdas.getRoleRequests,
        method: "GET",
      },
      submitRoleRequests: {
        path: "submitRoleRequests",
        lambda: lambdas.submitRoleRequests,
        method: "POST",
      },
      item: { path: "item", lambda: lambdas.item, method: "POST" },
      submit: { path: "submit", lambda: lambdas.submit, method: "POST" },
      saveDraft: { path: "saveDraft", lambda: lambdas.saveDraft, method: "POST" },
      deleteDraft: { path: "deleteDraft", lambda: lambdas.deleteDraft, method: "POST" },
      getTypes: {
        path: "getTypes",
        lambda: lambdas.getTypes,
        method: "POST",
      },
      getSubTypes: {
        path: "getSubTypes",
        lambda: lambdas.getSubTypes,
        method: "POST",
      },
      getCpocs: {
        path: "getCpocs",
        lambda: lambdas.getCpocs,
        method: "POST",
      },
      itemExists: {
        path: "itemExists",
        lambda: lambdas.itemExists,
        method: "POST",
      },
      forms: { path: "forms", lambda: lambdas.forms, method: "POST" },
      allForms: {
        path: "allForms",
        lambda: lambdas.getAllForms,
        method: "GET",
      },
      getSystemNotifs: { path: "systemNotifs", lambda: lambdas.getSystemNotifs, method: "GET" },
    };

    const addApiResource = (
      path: string,
      lambdaFunction: cdk.aws_lambda.Function,
      method: string = "POST",
      authorizationType: RouteAuthorization = "IAM",
      authorizer?: cdk.aws_apigateway.IAuthorizer,
    ) => {
      const resource = api.root.resourceForPath(path);

      // Define the integration for the Lambda function
      const integration = new cdk.aws_apigateway.LambdaIntegration(lambdaFunction, {
        proxy: true,
        credentialsRole: apiGatewayRole,
      });

      if (authorizationType === "CUSTOM" && !authorizer) {
        throw new Error(`Route ${path} is configured for CUSTOM auth but has no authorizer.`);
      }

      const authOptions: Pick<
        cdk.aws_apigateway.MethodOptions,
        "authorizationType" | "authorizer"
      > =
        authorizationType === "NONE"
          ? {
              authorizationType: cdk.aws_apigateway.AuthorizationType.NONE,
            }
          : authorizationType === "CUSTOM"
            ? {
                authorizationType: cdk.aws_apigateway.AuthorizationType.CUSTOM,
                authorizer,
              }
            : {
                authorizationType: cdk.aws_apigateway.AuthorizationType.IAM,
              };

      const methodOptions: cdk.aws_apigateway.MethodOptions = {
        ...authOptions,
        apiKeyRequired: false,
        methodResponses: [
          {
            statusCode: "200",
            responseParameters: {
              "method.response.header.Access-Control-Allow-Origin": true,
              "method.response.header.Access-Control-Allow-Headers": true,
              "method.response.header.Access-Control-Allow-Methods": true,
            },
          },
        ],
      };

      // Add method for specified HTTP method
      resource.addMethod(method, integration, methodOptions);
    };

    Object.values(apiResources).forEach((resource) => {
      addApiResource(
        resource.path,
        resource.lambda,
        resource.method,
        resource.authorizationType,
        resource.authorizer,
      );
    });

    // Define CloudWatch Alarms
    const createCloudWatchAlarm = (id: string, lambdaFunction: cdk.aws_lambda.Function) => {
      const alarm = new cdk.aws_cloudwatch.Alarm(this, id, {
        alarmName: `${project}-${stage}-${id}Alarm`,
        metric: new cdk.aws_cloudwatch.Metric({
          namespace: `${project}-api/Errors`,
          metricName: "LambdaErrorCount",
          dimensionsMap: {
            FunctionName: lambdaFunction.functionName,
          },
          statistic: "Sum",
          period: cdk.Duration.minutes(5),
        }),
        threshold: 1,
        evaluationPeriods: 1,
        comparisonOperator:
          cdk.aws_cloudwatch.ComparisonOperator.GREATER_THAN_OR_EQUAL_TO_THRESHOLD,
        treatMissingData: cdk.aws_cloudwatch.TreatMissingData.NOT_BREACHING,
      });

      alarm.addAlarmAction({
        bind: () => ({
          alarmActionArn: alertsTopic.topicArn!,
        }),
      });
    };

    Object.values(lambdas).forEach((lambdaFunc) => {
      createCloudWatchAlarm(`${lambdaFunc.node.id}ErrorAlarm`, lambdaFunc);
    });

    const waf = new LC.RegionalWaf(this, "WafConstruct", {
      name: `${project}-${stage}-${stack}`,
      apiGateway: api,
    });

    const logBucket = new Bucket(this, "LogBucket", {
      versioned: true,
      encryption: BucketEncryption.S3_MANAGED,
      blockPublicAccess: BlockPublicAccess.BLOCK_ALL,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      autoDeleteObjects: isDev,
    });

    logBucket.addToResourcePolicy(
      new PolicyStatement({
        effect: Effect.DENY,
        principals: [new AnyPrincipal()],
        actions: ["s3:*"],
        resources: [logBucket.bucketArn, `${logBucket.bucketArn}/*`],
        conditions: {
          Bool: { "aws:SecureTransport": "false" },
        },
      }),
    );

    new LC.EmptyBuckets(this, "EmptyBuckets", {
      buckets: [],
      bucketPrefixes: usesSharedArchiveOverlay
        ? [
            {
              bucket: archiveBucket,
              prefix: archiveOverlayPrefix,
            },
          ]
        : [],
    });

    if (!isDev) {
      new LC.CloudWatchToS3(this, "CloudWatchToS3Construct", {
        logGroup: waf.logGroup,
        bucket: logBucket,
      });
    }

    return { apiGateway: api };
  }
}
