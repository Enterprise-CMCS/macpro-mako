import * as cdk from "aws-cdk-lib";
import { Match, Template } from "aws-cdk-lib/assertions";
import { describe, expect, it } from "vitest";

import {
  buildSeatoolMissingRecordEscalationEnvironment,
  createSeatoolMissingRecordEscalationDailySchedule,
  shouldCreateSeatoolMissingRecordEscalationSchedule,
} from "./seatool-missing-record-escalation";

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
  const stack = new cdk.Stack(app, `SeatoolMissingRecord${stage}${isDev ? "Dev" : "Shared"}`, {
    env: {
      account: "123456789012",
      region: "us-east-1",
    },
  });
  const runLambda = createInlineLambda(
    stack,
    `RunSeatoolMissingRecordEscalation${stage}`,
    `mako-${stage}-api-runSeatoolMissingRecordEscalation`,
  );

  createSeatoolMissingRecordEscalationDailySchedule(stack, {
    project: "mako",
    stage,
    stack: "api",
    isDev,
    runSeatoolMissingRecordEscalationLambda: runLambda,
  });

  return Template.fromStack(stack);
}

describe("SEA Tool missing-record escalation scheduling", () => {
  it("builds the escalation lambda environment", () => {
    expect(
      buildSeatoolMissingRecordEscalationEnvironment({
        stage: "production",
        openSearchDomainEndpoint: "search-test-domain.us-east-1.es.amazonaws.com",
        indexNamespace: "production",
        reportBucketName: "mako-production-attachment-archives-123456789012",
        emailAddressLookupSecretName: "emailAddresses", // pragma: allowlist secret
      }),
    ).toEqual({
      osDomain: "https://search-test-domain.us-east-1.es.amazonaws.com",
      indexNamespace: "production",
      STAGE_NAME: "production",
      SEATOOL_MISSING_RECORD_BUCKET_NAME: "mako-production-attachment-archives-123456789012",
      SEATOOL_MISSING_RECORD_PREFIX: "seatool-missing-record",
      emailAddressLookupSecretName: "emailAddresses",
    });
  });

  for (const stage of ["main", "val", "production"] as const) {
    it(`creates an ENABLED daily 8 AM ET schedule for ${stage}`, () => {
      expect(shouldCreateSeatoolMissingRecordEscalationSchedule(stage, false)).toBe(true);

      const template = buildTemplate({
        stage,
        isDev: false,
      });

      template.hasResourceProperties("AWS::Scheduler::Schedule", {
        ScheduleExpression: "cron(0 8 * * ? *)",
        ScheduleExpressionTimezone: "America/New_York",
        FlexibleTimeWindow: {
          Mode: "OFF",
        },
        State: "ENABLED",
      });
      template.hasResourceProperties("AWS::Lambda::Function", {
        FunctionName: `mako-${stage}-api-runSeatoolMissingRecordEscalation`,
      });
      template.hasResourceProperties("AWS::IAM::Role", {
        AssumeRolePolicyDocument: {
          Statement: [
            {
              Action: "sts:AssumeRole",
              Effect: "Allow",
              Principal: {
                Service: "scheduler.amazonaws.com",
              },
              Condition: {
                StringEquals: {
                  "aws:SourceAccount": "123456789012",
                },
                ArnLike: {
                  "aws:SourceArn": "arn:aws:scheduler:us-east-1:123456789012:schedule-group/*",
                },
              },
            },
          ],
        },
        Policies: [
          {
            PolicyName: "SeatoolMissingRecordEscalationSchedulePolicy",
            PolicyDocument: {
              Statement: [
                {
                  Action: "lambda:InvokeFunction",
                  Effect: "Allow",
                  Resource: {
                    "Fn::GetAtt": Match.arrayWith(["Arn"]),
                  },
                },
              ],
            },
          },
        ],
      });
    });
  }

  it("does not create a schedule for non-shared stages", () => {
    expect(shouldCreateSeatoolMissingRecordEscalationSchedule("featurea", false)).toBe(false);

    const template = buildTemplate({
      stage: "featurea",
      isDev: false,
    });

    template.resourceCountIs("AWS::Scheduler::Schedule", 0);
  });

  it("does not create a schedule for dev stacks", () => {
    expect(shouldCreateSeatoolMissingRecordEscalationSchedule("main", true)).toBe(false);

    const template = buildTemplate({
      stage: "main",
      isDev: true,
    });

    template.resourceCountIs("AWS::Scheduler::Schedule", 0);
  });
});
