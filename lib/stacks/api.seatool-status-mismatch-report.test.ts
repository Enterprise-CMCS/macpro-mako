import * as cdk from "aws-cdk-lib";
import { Template } from "aws-cdk-lib/assertions";
import { describe, expect, it } from "vitest";

import {
  buildSeatoolStatusMismatchReportEnvironment,
  createSeatoolStatusMismatchReportDailySchedule,
  shouldCreateSeatoolStatusMismatchReportSchedule,
} from "./seatool-status-mismatch-report";

function createInlineLambda(
  stack: cdk.Stack,
  id: string,
  functionName: string,
): cdk.aws_lambda.Function {
  return new cdk.aws_lambda.Function(stack, id, {
    runtime: cdk.aws_lambda.Runtime.NODEJS_22_X,
    handler: "index.handler",
    code: cdk.aws_lambda.Code.fromInline("exports.handler = async () => ({ status: 'ok' });"),
    functionName,
  });
}

function buildTemplate({ stage, isDev }: { stage: string; isDev: boolean }) {
  const app = new cdk.App();
  const stack = new cdk.Stack(app, `SeatoolStatusMismatch${stage}${isDev ? "Dev" : "Shared"}`, {
    env: {
      account: "123456789012",
      region: "us-east-1",
    },
  });
  const runLambda = createInlineLambda(
    stack,
    `RunSeatoolStatusMismatchReport${stage}`,
    `mako-${stage}-api-runSeatoolStatusMismatchReport`,
  );

  createSeatoolStatusMismatchReportDailySchedule(stack, {
    project: "mako",
    stage,
    stack: "api",
    isDev,
    runSeatoolStatusMismatchReportLambda: runLambda,
  });

  return Template.fromStack(stack);
}

describe("SEATool status mismatch report scheduling", () => {
  it("builds the report lambda environment", () => {
    expect(
      buildSeatoolStatusMismatchReportEnvironment({
        stage: "production",
        brokerString: "broker1,broker2",
        openSearchDomainEndpoint: "search-test-domain.us-east-1.es.amazonaws.com",
        indexNamespace: "production",
        reportBucketName: "mako-production-attachment-archives-123456789012",
        emailAddressLookupSecretName: "emailAddresses", // pragma: allowlist secret
      }),
    ).toEqual({
      brokerString: "broker1,broker2",
      osDomain: "https://search-test-domain.us-east-1.es.amazonaws.com",
      indexNamespace: "production",
      STAGE_NAME: "production",
      SEATOOL_STATUS_MISMATCH_INPUT_SOURCE: "KAFKA",
      SEATOOL_STATUS_MISMATCH_INPUT_BUCKET_NAME: "mako-production-attachment-archives-123456789012",
      SEATOOL_STATUS_MISMATCH_INPUT_KEY_PREFIX: "seatool-status-mismatch/production/input/",
      SEATOOL_STATUS_MISMATCH_REPORT_BUCKET_NAME:
        "mako-production-attachment-archives-123456789012",
      SEATOOL_STATUS_MISMATCH_REPORT_PREFIX: "seatool-status-mismatch",
      SEATOOL_STATUS_MISMATCH_RECIPIENT_SECRET_KEY: "seatoolStatusMismatchAlerts",
      SEATOOL_STATUS_MISMATCH_SEATOOL_TOPIC: "aws.seatool.ksql.onemac.three.agg.State_Plan",
      emailAddressLookupSecretName: "emailAddresses",
    });
  });

  for (const stage of ["main", "val", "production"] as const) {
    it(`creates a daily schedule for ${stage}`, () => {
      expect(shouldCreateSeatoolStatusMismatchReportSchedule(stage, false)).toBe(true);

      const template = buildTemplate({
        stage,
        isDev: false,
      });

      template.hasResourceProperties("AWS::Scheduler::Schedule", {
        ScheduleExpression: "cron(0 21 * * ? *)",
        ScheduleExpressionTimezone: "America/New_York",
        State: stage === "production" ? "ENABLED" : "DISABLED",
      });
      template.hasResourceProperties("AWS::Lambda::Function", {
        FunctionName: `mako-${stage}-api-runSeatoolStatusMismatchReport`,
      });
    });
  }

  it("does not create a schedule for non-shared stages", () => {
    expect(shouldCreateSeatoolStatusMismatchReportSchedule("featurea", false)).toBe(false);

    const template = buildTemplate({
      stage: "featurea",
      isDev: false,
    });

    template.resourceCountIs("AWS::Scheduler::Schedule", 0);
  });

  it("does not create a schedule for dev stacks", () => {
    expect(shouldCreateSeatoolStatusMismatchReportSchedule("main", true)).toBe(false);

    const template = buildTemplate({
      stage: "main",
      isDev: true,
    });

    template.resourceCountIs("AWS::Scheduler::Schedule", 0);
  });
});
