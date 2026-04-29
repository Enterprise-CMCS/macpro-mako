import * as cdk from "aws-cdk-lib";
import { Template } from "aws-cdk-lib/assertions";
import { describe, expect, it } from "vitest";

import {
  buildAttachmentArchiveIntegrityRunEnvironment,
  buildAttachmentArchiveWorkerPolicyStatements,
  createAttachmentArchiveIntegrityDailySchedule,
  createAttachmentArchiveIntegrityStateMachine,
  shouldCreateAttachmentArchiveIntegritySchedule,
} from "./attachment-archive-integrity";

function createInlineLambda(
  stack: cdk.Stack,
  id: string,
  functionName: string,
): cdk.aws_lambda.Function {
  return new cdk.aws_lambda.Function(stack, id, {
    runtime: cdk.aws_lambda.Runtime.NODEJS_20_X,
    handler: "index.handler",
    code: cdk.aws_lambda.Code.fromInline("exports.handler = async () => ({ status: 'ok' });"),
    functionName,
  });
}

function buildApiTemplate({ stage, isDev }: { stage: string; isDev: boolean }) {
  const app = new cdk.App();
  const stack = new cdk.Stack(app, `ApiIntegrity${stage}${isDev ? "Dev" : "Shared"}`, {
    env: {
      account: "123456789012",
      region: "us-east-1",
    },
  });

  const runLambda = createInlineLambda(
    stack,
    `RunAttachmentArchiveIntegrityCheck${stage}`,
    `mako-${stage}-api-runAttachmentArchiveIntegrityCheck`,
  );
  const notifyLambda = createInlineLambda(
    stack,
    `NotifyAttachmentArchiveIntegrity${stage}`,
    `mako-${stage}-api-notifyAttachmentArchiveIntegrity`,
  );
  const stateMachine = createAttachmentArchiveIntegrityStateMachine(stack, {
    project: "mako",
    stage,
    stack: "api",
    runAttachmentArchiveIntegrityCheckLambda: runLambda,
    notifyAttachmentArchiveIntegrityLambda: notifyLambda,
  });

  createAttachmentArchiveIntegrityDailySchedule(stack, {
    project: "mako",
    stage,
    stack: "api",
    isDev,
    stateMachine,
  });

  return Template.fromStack(stack);
}

describe("Api attachment archive integrity scheduling", () => {
  for (const stage of ["main", "val", "production"] as const) {
    it(`creates the daily integrity schedule with ET timezone for ${stage}`, () => {
      expect(shouldCreateAttachmentArchiveIntegritySchedule(stage, false)).toBe(true);

      const template = buildApiTemplate({
        stage,
        isDev: false,
      });

      template.hasResourceProperties("AWS::Scheduler::Schedule", {
        ScheduleExpression: "cron(0 2 * * ? *)",
        ScheduleExpressionTimezone: "America/New_York",
        State: "ENABLED",
      });
      template.hasResourceProperties("AWS::Lambda::Function", {
        FunctionName: `mako-${stage}-api-runAttachmentArchiveIntegrityCheck`,
      });
      template.hasResourceProperties("AWS::Lambda::Function", {
        FunctionName: `mako-${stage}-api-notifyAttachmentArchiveIntegrity`,
      });
      const integrityStateMachines = template.findResources("AWS::StepFunctions::StateMachine", {
        Properties: {
          StateMachineName: `mako-${stage}-api-attachment-archive-integrity`,
        },
      });
      const integrityStateMachine = Object.values(integrityStateMachines)[0] as {
        Properties?: {
          DefinitionString?: {
            "Fn::Join"?: [string, Array<string | Record<string, unknown>>];
          };
        };
      };
      expect(integrityStateMachine).toBeDefined();
      const definitionParts =
        integrityStateMachine.Properties?.DefinitionString?.["Fn::Join"]?.[1] || [];
      const definitionString = definitionParts
        .map((part) => (typeof part === "string" ? part : JSON.stringify(part)))
        .join("");

      expect(definitionString).toContain('"StartAt":"RunAttachmentArchiveIntegrityCheckTask"');
      expect(definitionString).toContain('"Next":"AttachmentArchiveIntegrityInProgress"');
      expect(definitionString).toContain('"StringEquals":"IN_PROGRESS"');
      expect(definitionString).toContain('"Default":"AttachmentArchiveIntegrityHasDiscrepancies"');
    });
  }

  it("does not create a daily integrity schedule for non-shared stages", () => {
    expect(shouldCreateAttachmentArchiveIntegritySchedule("featurea", false)).toBe(false);

    const template = buildApiTemplate({
      stage: "featurea",
      isDev: false,
    });

    template.resourceCountIs("AWS::Scheduler::Schedule", 0);
  });

  it("does not create a daily integrity schedule for dev stacks", () => {
    expect(shouldCreateAttachmentArchiveIntegritySchedule("main", true)).toBe(false);

    const template = buildApiTemplate({
      stage: "main",
      isDev: true,
    });

    template.resourceCountIs("AWS::Scheduler::Schedule", 0);
  });

  it("enables the integrity exception registry for val and production lambdas", () => {
    const valEnvironment = buildAttachmentArchiveIntegrityRunEnvironment({
      stage: "val",
      openSearchDomainEndpoint: "search-test-domain.us-east-1.es.amazonaws.com",
      indexNamespace: "val",
      archiveWriteBucketName: "mako-val-attachment-archives-123456789012",
      archiveBaseReadBucketName: "mako-val-attachment-archives-123456789012",
      archiveOverlayPrefix: "",
    });
    expect(valEnvironment.ATTACHMENT_ARCHIVE_INTEGRITY_EXCEPTION_KEY).toBe(
      "archive-integrity/val/exception-registry.json",
    );

    const productionEnvironment = buildAttachmentArchiveIntegrityRunEnvironment({
      stage: "production",
      openSearchDomainEndpoint: "search-test-domain.us-east-1.es.amazonaws.com",
      indexNamespace: "production",
      archiveWriteBucketName: "mako-production-attachment-archives-123456789012",
      archiveBaseReadBucketName: "mako-production-attachment-archives-123456789012",
      archiveOverlayPrefix: "",
    });
    expect(productionEnvironment.ATTACHMENT_ARCHIVE_INTEGRITY_EXCEPTION_KEY).toBe(
      "archive-integrity/production/exception-registry.json",
    );

    const mainEnvironment = buildAttachmentArchiveIntegrityRunEnvironment({
      stage: "main",
      openSearchDomainEndpoint: "search-test-domain.us-east-1.es.amazonaws.com",
      indexNamespace: "main",
      archiveWriteBucketName: "mako-main-attachment-archives-123456789012",
      archiveBaseReadBucketName: "mako-main-attachment-archives-123456789012",
      archiveOverlayPrefix: "",
    });
    expect(mainEnvironment).not.toHaveProperty("ATTACHMENT_ARCHIVE_INTEGRITY_EXCEPTION_KEY");
  });

  it("grants the archive worker list access to the stage attachment bucket", () => {
    const statements = buildAttachmentArchiveWorkerPolicyStatements({
      attachmentsBucketArn: "arn:aws:s3:::mako-val-attachments-123456789012",
      sharedAttachmentReadBucketArn: "arn:aws:s3:::mako-val-attachments-123456789012",
      legacyMirrorBucketArns: [
        "arn:aws:s3:::mako-val-legacy-attachments-123456789012",
        "arn:aws:s3:::mako-val-legacy-attachmentsbucket-123456789012",
      ],
      archiveWriteBucketArn: "arn:aws:s3:::mako-val-attachment-archives-123456789012",
      legacyS3AccessRoleArn: "arn:aws:iam::123456789012:role/test-legacy-role",
    });
    const statementJson = statements.map((statement) => statement.toStatementJson());

    expect(statementJson).toContainEqual({
      Action: "s3:ListBucket",
      Effect: "Allow",
      Resource: "arn:aws:s3:::mako-val-attachments-123456789012",
    });
  });
});
