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
  getLegacyAttachmentBucketMapParameterName,
  getLegacyAttachmentMirrorBuckets,
  getSharedAttachmentReadBucket,
} from "./legacy-attachment-bucket-map";

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
          ],
        }),
      },
    });

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
        runtime: cdk.aws_lambda.Runtime.NODEJS_20_X,
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
        id: "getAttachmentArchive",
        entry: join(__dirname, "../lambda/getAttachmentArchive.ts"),
        environment: {
          osDomain: `https://${openSearchDomainEndpoint}`,
          indexNamespace,
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

    const archiveWorkerLogGroup = new cdk.aws_logs.LogGroup(
      this,
      "AttachmentArchiveWorkerLogGroup",
      {
        logGroupName: `/aws/ecs/${project}-${stage}-${stack}-attachment-archive-worker`,
        removalPolicy: cdk.RemovalPolicy.DESTROY,
      },
    );

    const archiveWorkerImage = new cdk.aws_ecr_assets.DockerImageAsset(
      this,
      "AttachmentArchiveWorkerImage",
      {
        directory: join(__dirname, "../attachment-archive"),
        platform: cdk.aws_ecr_assets.Platform.LINUX_AMD64,
      },
    );

    const archiveWorkerCluster = new cdk.aws_ecs.Cluster(this, "AttachmentArchiveCluster", {
      vpc,
      clusterName: `${project}-${stage}-${stack}-attachment-archive`,
    });

    const archiveWorkerTaskRole = new cdk.aws_iam.Role(this, "AttachmentArchiveWorkerTaskRole", {
      assumedBy: new cdk.aws_iam.ServicePrincipal("ecs-tasks.amazonaws.com"),
      inlinePolicies: {
        AttachmentArchiveWorkerPolicy: new cdk.aws_iam.PolicyDocument({
          statements: [
            new cdk.aws_iam.PolicyStatement({
              effect: cdk.aws_iam.Effect.ALLOW,
              actions: ["s3:GetObject", "s3:GetObjectTagging"],
              resources: [`${attachmentsBucket.bucketArn}/*`],
            }),
            new cdk.aws_iam.PolicyStatement({
              effect: cdk.aws_iam.Effect.ALLOW,
              actions: ["s3:GetObject", "s3:GetObjectTagging"],
              resources: [`${sharedAttachmentReadBucket.arn}/*`],
            }),
            new cdk.aws_iam.PolicyStatement({
              effect: cdk.aws_iam.Effect.ALLOW,
              actions: ["s3:GetObject"],
              resources: legacyMirrorBucketArns.map((bucketArn) => `${bucketArn}/*`),
            }),
            new cdk.aws_iam.PolicyStatement({
              effect: cdk.aws_iam.Effect.ALLOW,
              actions: ["s3:ListBucket"],
              resources: legacyMirrorBucketArns,
            }),
            new cdk.aws_iam.PolicyStatement({
              effect: cdk.aws_iam.Effect.ALLOW,
              actions: ["s3:GetObject", "s3:PutObject"],
              resources: [`${archiveWriteBucketArn}/*`],
            }),
            new cdk.aws_iam.PolicyStatement({
              effect: cdk.aws_iam.Effect.ALLOW,
              actions: ["sts:AssumeRole"],
              resources: [legacyS3AccessRoleArn],
            }),
          ],
        }),
      },
    });

    const archiveWorkerTaskDefinition = new cdk.aws_ecs.FargateTaskDefinition(
      this,
      "AttachmentArchiveTaskDefinition",
      {
        cpu: 1024,
        memoryLimitMiB: 4096,
        taskRole: archiveWorkerTaskRole,
      },
    );

    const archiveWorkerContainer = archiveWorkerTaskDefinition.addContainer(
      "AttachmentArchiveWorkerContainer",
      {
        image: cdk.aws_ecs.ContainerImage.fromDockerImageAsset(archiveWorkerImage),
        logging: new cdk.aws_ecs.AwsLogDriver({
          streamPrefix: "attachment-archive",
          logGroup: archiveWorkerLogGroup,
        }),
        environment: {
          LEGACY_ATTACHMENT_BUCKET_MAP: legacyAttachmentBucketMap,
          LEGACY_S3_ACCESS_ROLE_ARN: legacyS3AccessRoleArn,
        },
      },
    );

    const markAttachmentArchiveFailedTask = new cdk.aws_stepfunctions_tasks.LambdaInvoke(
      this,
      "MarkAttachmentArchiveFailedTask",
      {
        lambdaFunction: lambdas.markAttachmentArchiveFailed,
        outputPath: "$.Payload",
        payload: cdk.aws_stepfunctions.TaskInput.fromObject({
          "archiveBucketName.$": "$.archiveBucketName",
          "artifactKey.$": "$.artifactKey",
          "attachmentCount.$": "$.attachmentCount",
          "currentKey.$": "$.currentKey",
          "error.$": "$.error",
          "hash.$": "$.hash",
          "manifestKey.$": "$.manifestKey",
        }),
      },
    );

    const attachmentArchiveFailed = new cdk.aws_stepfunctions.Fail(
      this,
      "AttachmentArchiveFailure",
      {
        cause: "Attachment archive execution did not produce a valid ready artifact.",
        error: "AttachmentArchiveValidationFailed",
      },
    );

    markAttachmentArchiveFailedTask.next(attachmentArchiveFailed);

    const runArchiveWorkerTask = new cdk.aws_stepfunctions_tasks.EcsRunTask(
      this,
      "RunAttachmentArchiveWorkerTask",
      {
        cluster: archiveWorkerCluster,
        taskDefinition: archiveWorkerTaskDefinition,
        integrationPattern: cdk.aws_stepfunctions.IntegrationPattern.RUN_JOB,
        launchTarget: new cdk.aws_stepfunctions_tasks.EcsFargateLaunchTarget(),
        assignPublicIp: false,
        resultPath: cdk.aws_stepfunctions.JsonPath.DISCARD,
        containerOverrides: [
          {
            containerDefinition: archiveWorkerContainer,
            environment: [
              {
                name: "ARCHIVE_BUCKET_NAME",
                value: cdk.aws_stepfunctions.JsonPath.stringAt("$.archiveBucketName"),
              },
              {
                name: "ARCHIVE_CURRENT_KEY",
                value: cdk.aws_stepfunctions.JsonPath.stringAt("$.currentKey"),
              },
              {
                name: "ARCHIVE_MANIFEST_KEY",
                value: cdk.aws_stepfunctions.JsonPath.stringAt("$.manifestKey"),
              },
              {
                name: "ARCHIVE_ARTIFACT_KEY",
                value: cdk.aws_stepfunctions.JsonPath.stringAt("$.artifactKey"),
              },
              {
                name: "ATTACHMENT_ARCHIVE_HASH",
                value: cdk.aws_stepfunctions.JsonPath.stringAt("$.hash"),
              },
            ],
          },
        ],
        securityGroups: [lambdaSecurityGroup],
        subnets: { subnets: privateSubnets },
      },
    ).addCatch(markAttachmentArchiveFailedTask, {
      errors: ["States.ALL"],
      resultPath: "$.error",
    });

    const validateAttachmentArchiveTask = new cdk.aws_stepfunctions_tasks.LambdaInvoke(
      this,
      "ValidateAttachmentArchiveTask",
      {
        lambdaFunction: lambdas.validateAttachmentArchive,
        outputPath: "$.Payload",
        payload: cdk.aws_stepfunctions.TaskInput.fromObject({
          "archiveBucketName.$": "$.archiveBucketName",
          "artifactKey.$": "$.artifactKey",
          "currentKey.$": "$.currentKey",
          "hash.$": "$.hash",
        }),
      },
    ).addCatch(markAttachmentArchiveFailedTask, {
      errors: ["States.ALL"],
      resultPath: "$.error",
    });

    const archiveStateMachineLogGroup = new cdk.aws_logs.LogGroup(
      this,
      "AttachmentArchiveStateMachineLogGroup",
      {
        logGroupName: `/aws/vendedlogs/states/${project}-${stage}-${stack}-attachment-archive`,
        removalPolicy: cdk.RemovalPolicy.DESTROY,
      },
    );

    const archiveStateMachine = new cdk.aws_stepfunctions.StateMachine(
      this,
      "AttachmentArchiveStateMachine",
      {
        definitionBody: cdk.aws_stepfunctions.DefinitionBody.fromChainable(
          runArchiveWorkerTask
            .next(validateAttachmentArchiveTask)
            .next(new cdk.aws_stepfunctions.Succeed(this, "AttachmentArchiveSuccess")),
        ),
        stateMachineName: `${project}-${stage}-${stack}-attachment-archive`,
        logs: {
          destination: archiveStateMachineLogGroup,
          includeExecutionData: true,
          level: cdk.aws_stepfunctions.LogLevel.ALL,
        },
      },
    );

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

    const apiResources = {
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
    ) => {
      const resource = api.root.resourceForPath(path);

      // Define the integration for the Lambda function
      const integration = new cdk.aws_apigateway.LambdaIntegration(lambdaFunction, {
        proxy: true,
        credentialsRole: apiGatewayRole,
      });

      // Add method for specified HTTP method
      resource.addMethod(method, integration, {
        authorizationType: cdk.aws_apigateway.AuthorizationType.IAM,
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
      });
    };

    Object.values(apiResources).forEach((resource) => {
      addApiResource(resource.path, resource.lambda, resource.method);
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
