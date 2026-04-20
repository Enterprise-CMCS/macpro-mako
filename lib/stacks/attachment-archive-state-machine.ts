import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";

import { buildAttachmentArchiveWorkerPolicyStatements } from "./attachment-archive-integrity";

export const ATTACHMENT_ARCHIVE_WORKER_TASK_TIMEOUT = cdk.Duration.minutes(15);

export function createAttachmentArchiveStateMachine(
  scope: Construct,
  {
    archiveWorkerImage,
    archiveWriteBucketArn,
    attachmentsBucketArn,
    lambdaSecurityGroup,
    legacyAttachmentBucketMap,
    legacyMirrorBucketArns,
    legacyS3AccessRoleArn,
    markAttachmentArchiveFailedLambda,
    privateSubnets,
    project,
    sharedAttachmentReadBucketArn,
    stack,
    stage,
    validateAttachmentArchiveLambda,
    vpc,
  }: {
    archiveWorkerImage: cdk.aws_ecs.ContainerImage;
    archiveWriteBucketArn: string;
    attachmentsBucketArn: string;
    lambdaSecurityGroup: cdk.aws_ec2.ISecurityGroup;
    legacyAttachmentBucketMap: string;
    legacyMirrorBucketArns: string[];
    legacyS3AccessRoleArn: string;
    markAttachmentArchiveFailedLambda: cdk.aws_lambda.IFunction;
    privateSubnets: cdk.aws_ec2.ISubnet[];
    project: string;
    sharedAttachmentReadBucketArn: string;
    stack: string;
    stage: string;
    validateAttachmentArchiveLambda: cdk.aws_lambda.IFunction;
    vpc: cdk.aws_ec2.IVpc;
  },
): cdk.aws_stepfunctions.StateMachine {
  const archiveWorkerLogGroup = new cdk.aws_logs.LogGroup(scope, "AttachmentArchiveWorkerLogGroup", {
    logGroupName: `/aws/ecs/${project}-${stage}-${stack}-attachment-archive-worker`,
    removalPolicy: cdk.RemovalPolicy.DESTROY,
  });

  const archiveWorkerCluster = new cdk.aws_ecs.Cluster(scope, "AttachmentArchiveCluster", {
    vpc,
    clusterName: `${project}-${stage}-${stack}-attachment-archive`,
  });

  const archiveWorkerTaskRole = new cdk.aws_iam.Role(scope, "AttachmentArchiveWorkerTaskRole", {
    assumedBy: new cdk.aws_iam.ServicePrincipal("ecs-tasks.amazonaws.com"),
    inlinePolicies: {
      AttachmentArchiveWorkerPolicy: new cdk.aws_iam.PolicyDocument({
        statements: buildAttachmentArchiveWorkerPolicyStatements({
          attachmentsBucketArn,
          sharedAttachmentReadBucketArn,
          legacyMirrorBucketArns,
          archiveWriteBucketArn,
          legacyS3AccessRoleArn,
        }),
      }),
    },
  });

  const archiveWorkerTaskDefinition = new cdk.aws_ecs.FargateTaskDefinition(
    scope,
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
      image: archiveWorkerImage,
      logging: new cdk.aws_ecs.AwsLogDriver({
        streamPrefix: "attachment-archive",
        logGroup: archiveWorkerLogGroup,
      }),
      environment: {
        LEGACY_ATTACHMENT_BUCKET_MAP: legacyAttachmentBucketMap,
        LEGACY_S3_ACCESS_ROLE_ARN: legacyS3AccessRoleArn,
        TZ: "America/New_York",
      },
    },
  );

  const markAttachmentArchiveFailedTask = new cdk.aws_stepfunctions_tasks.LambdaInvoke(
    scope,
    "MarkAttachmentArchiveFailedTask",
    {
      lambdaFunction: markAttachmentArchiveFailedLambda,
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

  const attachmentArchiveFailed = new cdk.aws_stepfunctions.Fail(scope, "AttachmentArchiveFailure", {
    cause: "Attachment archive execution did not produce a valid ready artifact.",
    error: "AttachmentArchiveValidationFailed",
  });

  markAttachmentArchiveFailedTask.next(attachmentArchiveFailed);

  const runArchiveWorkerTask = new cdk.aws_stepfunctions_tasks.EcsRunTask(
    scope,
    "RunAttachmentArchiveWorkerTask",
    {
      cluster: archiveWorkerCluster,
      taskDefinition: archiveWorkerTaskDefinition,
      integrationPattern: cdk.aws_stepfunctions.IntegrationPattern.RUN_JOB,
      launchTarget: new cdk.aws_stepfunctions_tasks.EcsFargateLaunchTarget(),
      assignPublicIp: false,
      resultPath: cdk.aws_stepfunctions.JsonPath.DISCARD,
      taskTimeout: cdk.aws_stepfunctions.Timeout.duration(
        ATTACHMENT_ARCHIVE_WORKER_TASK_TIMEOUT,
      ),
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
    scope,
    "ValidateAttachmentArchiveTask",
    {
      lambdaFunction: validateAttachmentArchiveLambda,
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
    scope,
    "AttachmentArchiveStateMachineLogGroup",
    {
      logGroupName: `/aws/vendedlogs/states/${project}-${stage}-${stack}-attachment-archive`,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    },
  );

  return new cdk.aws_stepfunctions.StateMachine(scope, "AttachmentArchiveStateMachine", {
    definitionBody: cdk.aws_stepfunctions.DefinitionBody.fromChainable(
      runArchiveWorkerTask
        .next(validateAttachmentArchiveTask)
        .next(new cdk.aws_stepfunctions.Succeed(scope, "AttachmentArchiveSuccess")),
    ),
    stateMachineName: `${project}-${stage}-${stack}-attachment-archive`,
    logs: {
      destination: archiveStateMachineLogGroup,
      includeExecutionData: true,
      level: cdk.aws_stepfunctions.LogLevel.ALL,
    },
  });
}
