import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";

import { isSharedArchiveStage } from "./archive-bucket-routing";

export const ATTACHMENT_ARCHIVE_INTEGRITY_REPORT_PREFIX = "archive-integrity";
export const ATTACHMENT_ARCHIVE_INTEGRITY_VAL_EXCEPTION_KEY =
  "archive-integrity/val/exception-registry.json";
export const ATTACHMENT_ARCHIVE_INTEGRITY_PRODUCTION_EXCEPTION_KEY =
  "archive-integrity/production/exception-registry.json";

export function getAttachmentArchiveIntegrityExceptionKey(stage: string): string | undefined {
  if (stage === "val") {
    return ATTACHMENT_ARCHIVE_INTEGRITY_VAL_EXCEPTION_KEY;
  }
  if (stage === "production") {
    return ATTACHMENT_ARCHIVE_INTEGRITY_PRODUCTION_EXCEPTION_KEY;
  }
  return undefined;
}

export function shouldCreateAttachmentArchiveIntegritySchedule(
  stage: string,
  isDev: boolean,
): boolean {
  return !isDev && isSharedArchiveStage(stage);
}

export function buildAttachmentArchiveIntegrityRunEnvironment({
  stage,
  openSearchDomainEndpoint,
  indexNamespace,
  archiveWriteBucketName,
  archiveBaseReadBucketName,
  archiveOverlayPrefix,
}: {
  stage: string;
  openSearchDomainEndpoint: string;
  indexNamespace: string;
  archiveWriteBucketName: string;
  archiveBaseReadBucketName: string;
  archiveOverlayPrefix: string;
}): Record<string, string> {
  const exceptionKey = getAttachmentArchiveIntegrityExceptionKey(stage);

  return {
    osDomain: `https://${openSearchDomainEndpoint}`,
    indexNamespace,
    STAGE_NAME: stage,
    ATTACHMENT_ARCHIVE_BUCKET_NAME: archiveWriteBucketName,
    ATTACHMENT_ARCHIVE_BASE_BUCKET_NAME: archiveBaseReadBucketName,
    ATTACHMENT_ARCHIVE_KEY_PREFIX: archiveOverlayPrefix,
    ATTACHMENT_ARCHIVE_INTEGRITY_REPORT_PREFIX,
    ...(exceptionKey
      ? {
          ATTACHMENT_ARCHIVE_INTEGRITY_EXCEPTION_KEY: exceptionKey,
        }
      : {}),
  };
}

export function buildAttachmentArchiveIntegrityNotificationEnvironment({
  stage,
  archiveWriteBucketName,
  emailAddressLookupSecretName,
}: {
  stage: string;
  archiveWriteBucketName: string;
  emailAddressLookupSecretName: string;
}): Record<string, string> {
  return {
    STAGE_NAME: stage,
    ATTACHMENT_ARCHIVE_BUCKET_NAME: archiveWriteBucketName,
    ATTACHMENT_ARCHIVE_INTEGRITY_REPORT_PREFIX,
    emailAddressLookupSecretName,
  };
}

export function buildAttachmentArchiveWorkerPolicyStatements({
  attachmentsBucketArn,
  sharedAttachmentReadBucketArn,
  legacyMirrorBucketArns,
  archiveWriteBucketArn,
  legacyS3AccessRoleArn,
}: {
  attachmentsBucketArn: string;
  sharedAttachmentReadBucketArn: string;
  legacyMirrorBucketArns: string[];
  archiveWriteBucketArn: string;
  legacyS3AccessRoleArn: string;
}): cdk.aws_iam.PolicyStatement[] {
  return [
    new cdk.aws_iam.PolicyStatement({
      effect: cdk.aws_iam.Effect.ALLOW,
      actions: ["s3:GetObject", "s3:GetObjectTagging"],
      resources: [`${attachmentsBucketArn}/*`],
    }),
    new cdk.aws_iam.PolicyStatement({
      effect: cdk.aws_iam.Effect.ALLOW,
      actions: ["s3:ListBucket"],
      resources: [attachmentsBucketArn],
    }),
    new cdk.aws_iam.PolicyStatement({
      effect: cdk.aws_iam.Effect.ALLOW,
      actions: ["s3:GetObject", "s3:GetObjectTagging"],
      resources: [`${sharedAttachmentReadBucketArn}/*`],
    }),
    new cdk.aws_iam.PolicyStatement({
      effect: cdk.aws_iam.Effect.ALLOW,
      actions: ["s3:ListBucket"],
      resources: [sharedAttachmentReadBucketArn],
    }),
    new cdk.aws_iam.PolicyStatement({
      effect: cdk.aws_iam.Effect.ALLOW,
      actions: ["s3:GetObject", "s3:GetObjectTagging"],
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
  ];
}

export function createAttachmentArchiveIntegrityStateMachine(
  scope: Construct,
  {
    project,
    stage,
    stack,
    runAttachmentArchiveIntegrityCheckLambda,
    notifyAttachmentArchiveIntegrityLambda,
  }: {
    project: string;
    stage: string;
    stack: string;
    runAttachmentArchiveIntegrityCheckLambda: cdk.aws_lambda.IFunction;
    notifyAttachmentArchiveIntegrityLambda: cdk.aws_lambda.IFunction;
  },
): cdk.aws_stepfunctions.StateMachine {
  const archiveIntegrityStateMachineLogGroup = new cdk.aws_logs.LogGroup(
    scope,
    "AttachmentArchiveIntegrityStateMachineLogGroup",
    {
      logGroupName: `/aws/vendedlogs/states/${project}-${stage}-${stack}-attachment-archive-integrity`,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    },
  );

  const runAttachmentArchiveIntegrityCheckTask = new cdk.aws_stepfunctions_tasks.LambdaInvoke(
    scope,
    "RunAttachmentArchiveIntegrityCheckTask",
    {
      lambdaFunction: runAttachmentArchiveIntegrityCheckLambda,
      payloadResponseOnly: true,
      resultPath: "$.runResult",
    },
  );

  const notifyAttachmentArchiveIntegrityDiscrepanciesTask =
    new cdk.aws_stepfunctions_tasks.LambdaInvoke(
      scope,
      "NotifyAttachmentArchiveIntegrityDiscrepanciesTask",
      {
        lambdaFunction: notifyAttachmentArchiveIntegrityLambda,
        payloadResponseOnly: true,
        payload: cdk.aws_stepfunctions.TaskInput.fromObject({
          mode: "discrepancy",
          "runResult.$": "$.runResult",
        }),
        resultPath: "$.notification",
      },
    );

  const notifyAttachmentArchiveIntegrityFailureTask = new cdk.aws_stepfunctions_tasks.LambdaInvoke(
    scope,
    "NotifyAttachmentArchiveIntegrityFailureTask",
    {
      lambdaFunction: notifyAttachmentArchiveIntegrityLambda,
      payloadResponseOnly: true,
      payload: cdk.aws_stepfunctions.TaskInput.fromObject({
        mode: "failure",
        "input.$": "$",
      }),
      resultPath: "$.failureNotification",
    },
  );

  const attachmentArchiveIntegrityFailure = new cdk.aws_stepfunctions.Fail(
    scope,
    "AttachmentArchiveIntegrityFailure",
    {
      cause: "Attachment archive integrity workflow failed.",
      error: "AttachmentArchiveIntegrityFailure",
    },
  );
  notifyAttachmentArchiveIntegrityFailureTask.next(attachmentArchiveIntegrityFailure);

  runAttachmentArchiveIntegrityCheckTask.addCatch(notifyAttachmentArchiveIntegrityFailureTask, {
    errors: ["States.ALL"],
    resultPath: "$.error",
  });
  notifyAttachmentArchiveIntegrityDiscrepanciesTask.addCatch(
    notifyAttachmentArchiveIntegrityFailureTask,
    {
      errors: ["States.ALL"],
      resultPath: "$.error",
    },
  );

  const attachmentArchiveIntegrityNoDiscrepancies = new cdk.aws_stepfunctions.Succeed(
    scope,
    "AttachmentArchiveIntegrityNoDiscrepancies",
  );
  const attachmentArchiveIntegrityCompleted = new cdk.aws_stepfunctions.Succeed(
    scope,
    "AttachmentArchiveIntegrityCompleted",
  );
  const attachmentArchiveIntegrityInProgress = new cdk.aws_stepfunctions.Choice(
    scope,
    "AttachmentArchiveIntegrityInProgress",
  );
  const attachmentArchiveIntegrityHasDiscrepanciesChoice = new cdk.aws_stepfunctions.Choice(
    scope,
    "AttachmentArchiveIntegrityHasDiscrepancies",
  );
  attachmentArchiveIntegrityInProgress
    .when(
      cdk.aws_stepfunctions.Condition.stringEquals("$.runResult.status", "IN_PROGRESS"),
      runAttachmentArchiveIntegrityCheckTask,
    )
    .otherwise(attachmentArchiveIntegrityHasDiscrepanciesChoice);
  attachmentArchiveIntegrityHasDiscrepanciesChoice
    .when(
      cdk.aws_stepfunctions.Condition.numberGreaterThan("$.runResult.discrepancyCount", 0),
      notifyAttachmentArchiveIntegrityDiscrepanciesTask.next(attachmentArchiveIntegrityCompleted),
    )
    .otherwise(attachmentArchiveIntegrityNoDiscrepancies);

  return new cdk.aws_stepfunctions.StateMachine(scope, "AttachmentArchiveIntegrityStateMachine", {
    definitionBody: cdk.aws_stepfunctions.DefinitionBody.fromChainable(
      runAttachmentArchiveIntegrityCheckTask.next(attachmentArchiveIntegrityInProgress),
    ),
    stateMachineName: `${project}-${stage}-${stack}-attachment-archive-integrity`,
    logs: {
      destination: archiveIntegrityStateMachineLogGroup,
      includeExecutionData: true,
      level: cdk.aws_stepfunctions.LogLevel.ALL,
    },
    stateMachineType: cdk.aws_stepfunctions.StateMachineType.STANDARD,
  });
}

export function createAttachmentArchiveIntegrityDailySchedule(
  scope: Construct,
  {
    project,
    stage,
    stack,
    isDev,
    stateMachine,
  }: {
    project: string;
    stage: string;
    stack: string;
    isDev: boolean;
    stateMachine: cdk.aws_stepfunctions.IStateMachine;
  },
): cdk.aws_scheduler.CfnSchedule | undefined {
  if (!shouldCreateAttachmentArchiveIntegritySchedule(stage, isDev)) {
    return undefined;
  }

  const attachmentArchiveIntegrityScheduleRole = new cdk.aws_iam.Role(
    scope,
    "AttachmentArchiveIntegrityScheduleRole",
    {
      assumedBy: new cdk.aws_iam.ServicePrincipal("scheduler.amazonaws.com"),
      inlinePolicies: {
        AttachmentArchiveIntegritySchedulePolicy: new cdk.aws_iam.PolicyDocument({
          statements: [
            new cdk.aws_iam.PolicyStatement({
              effect: cdk.aws_iam.Effect.ALLOW,
              actions: ["states:StartExecution"],
              resources: [stateMachine.stateMachineArn],
            }),
          ],
        }),
      },
    },
  );

  return new cdk.aws_scheduler.CfnSchedule(scope, "AttachmentArchiveIntegrityDailySchedule", {
    description: "Run OneMAC attachment archive integrity check daily.",
    flexibleTimeWindow: {
      mode: "OFF",
    },
    name: `${project}-${stage}-${stack}-attachment-archive-integrity-daily`,
    scheduleExpression: "cron(0 2 * * ? *)",
    scheduleExpressionTimezone: "America/New_York",
    state: "ENABLED",
    target: {
      arn: stateMachine.stateMachineArn,
      input: JSON.stringify({
        source: "daily-integrity-schedule",
      }),
      roleArn: attachmentArchiveIntegrityScheduleRole.roleArn,
    },
  });
}
