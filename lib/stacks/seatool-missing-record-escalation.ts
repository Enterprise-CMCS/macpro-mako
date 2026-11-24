import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";

import { isSharedArchiveStage } from "./archive-bucket-routing";

export const SEATOOL_MISSING_RECORD_PREFIX = "seatool-missing-record";
export const SEATOOL_MISSING_RECORD_DEFAULT_SCHEDULE_EXPRESSION = "cron(0 8 * * ? *)";
export const SEATOOL_MISSING_RECORD_DEFAULT_SCHEDULE_TIMEZONE = "America/New_York";

export function buildSeatoolMissingRecordEscalationEnvironment({
  stage,
  openSearchDomainEndpoint,
  indexNamespace,
  reportBucketName,
  emailAddressLookupSecretName,
}: {
  stage: string;
  openSearchDomainEndpoint: string;
  indexNamespace: string;
  reportBucketName: string;
  emailAddressLookupSecretName: string;
}): Record<string, string> {
  return {
    osDomain: `https://${openSearchDomainEndpoint}`,
    indexNamespace,
    STAGE_NAME: stage,
    SEATOOL_MISSING_RECORD_BUCKET_NAME: reportBucketName,
    SEATOOL_MISSING_RECORD_PREFIX: SEATOOL_MISSING_RECORD_PREFIX,
    emailAddressLookupSecretName,
  };
}

export function shouldCreateSeatoolMissingRecordEscalationSchedule(
  stage: string,
  isDev: boolean,
): boolean {
  return !isDev && isSharedArchiveStage(stage);
}

export function createSeatoolMissingRecordEscalationDailySchedule(
  scope: Construct,
  {
    project,
    stage,
    stack,
    isDev,
    runSeatoolMissingRecordEscalationLambda,
    enabled,
    scheduleExpression = SEATOOL_MISSING_RECORD_DEFAULT_SCHEDULE_EXPRESSION,
    scheduleExpressionTimezone = SEATOOL_MISSING_RECORD_DEFAULT_SCHEDULE_TIMEZONE,
  }: {
    project: string;
    stage: string;
    stack: string;
    isDev: boolean;
    runSeatoolMissingRecordEscalationLambda: cdk.aws_lambda.IFunction;
    enabled?: boolean;
    scheduleExpression?: string;
    scheduleExpressionTimezone?: string;
  },
): cdk.aws_scheduler.CfnSchedule | undefined {
  if (!shouldCreateSeatoolMissingRecordEscalationSchedule(stage, isDev)) {
    return undefined;
  }

  const parentStack = cdk.Stack.of(scope);
  const scheduleEnabled = enabled ?? true;
  const scheduleRole = new cdk.aws_iam.Role(scope, "SeatoolMissingRecordEscalationScheduleRole", {
    assumedBy: new cdk.aws_iam.ServicePrincipal("scheduler.amazonaws.com", {
      conditions: {
        StringEquals: {
          "aws:SourceAccount": parentStack.account,
        },
        ArnLike: {
          "aws:SourceArn": `arn:aws:scheduler:${parentStack.region}:${parentStack.account}:schedule-group/*`,
        },
      },
    }),
    inlinePolicies: {
      SeatoolMissingRecordEscalationSchedulePolicy: new cdk.aws_iam.PolicyDocument({
        statements: [
          new cdk.aws_iam.PolicyStatement({
            effect: cdk.aws_iam.Effect.ALLOW,
            actions: ["lambda:InvokeFunction"],
            resources: [runSeatoolMissingRecordEscalationLambda.functionArn],
          }),
        ],
      }),
    },
  });

  return new cdk.aws_scheduler.CfnSchedule(scope, "SeatoolMissingRecordEscalationDailySchedule", {
    description: "Run OneMAC to SEA Tool missing-record escalation daily at 8 AM ET.",
    flexibleTimeWindow: {
      mode: "OFF",
    },
    name: `${project}-${stage}-${stack}-seatool-missing-record-daily`,
    scheduleExpression,
    scheduleExpressionTimezone,
    state: scheduleEnabled ? "ENABLED" : "DISABLED",
    target: {
      arn: runSeatoolMissingRecordEscalationLambda.functionArn,
      input: JSON.stringify({
        source: "daily-seatool-missing-record-schedule",
      }),
      roleArn: scheduleRole.roleArn,
    },
  });
}
