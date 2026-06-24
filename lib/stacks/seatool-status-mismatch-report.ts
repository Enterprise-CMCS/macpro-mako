import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";

import { isSharedArchiveStage } from "./archive-bucket-routing";

export const SEATOOL_STATUS_MISMATCH_REPORT_PREFIX = "seatool-status-mismatch";
export const SEATOOL_STATUS_MISMATCH_DEFAULT_RECIPIENT_CONFIG_FIELD = "seatoolStatusMismatchAlerts";
export const SEATOOL_STATUS_MISMATCH_DEFAULT_SCHEDULE_EXPRESSION = "cron(0 21 * * ? *)";
export const SEATOOL_STATUS_MISMATCH_DEFAULT_SCHEDULE_TIMEZONE = "America/New_York";
export const SEATOOL_STATUS_MISMATCH_SEATOOL_TOPIC = "aws.seatool.ksql.onemac.three.agg.State_Plan";

export function buildSeatoolStatusMismatchReportEnvironment({
  stage,
  brokerString,
  openSearchDomainEndpoint,
  indexNamespace,
  reportBucketName,
  emailAddressLookupSecretName,
  recipientConfigField = SEATOOL_STATUS_MISMATCH_DEFAULT_RECIPIENT_CONFIG_FIELD,
}: {
  stage: string;
  brokerString: string;
  openSearchDomainEndpoint: string;
  indexNamespace: string;
  reportBucketName: string;
  emailAddressLookupSecretName: string;
  recipientConfigField?: string;
}): Record<string, string> {
  return {
    brokerString,
    osDomain: `https://${openSearchDomainEndpoint}`,
    indexNamespace,
    STAGE_NAME: stage,
    SEATOOL_STATUS_MISMATCH_INPUT_SOURCE: "KAFKA",
    SEATOOL_STATUS_MISMATCH_INPUT_BUCKET_NAME: reportBucketName,
    SEATOOL_STATUS_MISMATCH_INPUT_KEY_PREFIX: `${SEATOOL_STATUS_MISMATCH_REPORT_PREFIX}/${stage}/input/`,
    SEATOOL_STATUS_MISMATCH_REPORT_BUCKET_NAME: reportBucketName,
    SEATOOL_STATUS_MISMATCH_REPORT_PREFIX: SEATOOL_STATUS_MISMATCH_REPORT_PREFIX,
    SEATOOL_STATUS_MISMATCH_RECIPIENT_CONFIG_FIELD: recipientConfigField,
    SEATOOL_STATUS_MISMATCH_SEATOOL_TOPIC: SEATOOL_STATUS_MISMATCH_SEATOOL_TOPIC,
    emailAddressLookupSecretName,
  };
}

export function shouldCreateSeatoolStatusMismatchReportSchedule(
  stage: string,
  isDev: boolean,
): boolean {
  return !isDev && isSharedArchiveStage(stage);
}

export function createSeatoolStatusMismatchReportDailySchedule(
  scope: Construct,
  {
    project,
    stage,
    stack,
    isDev,
    runSeatoolStatusMismatchReportLambda,
    enabled,
    scheduleExpression = SEATOOL_STATUS_MISMATCH_DEFAULT_SCHEDULE_EXPRESSION,
    scheduleExpressionTimezone = SEATOOL_STATUS_MISMATCH_DEFAULT_SCHEDULE_TIMEZONE,
  }: {
    project: string;
    stage: string;
    stack: string;
    isDev: boolean;
    runSeatoolStatusMismatchReportLambda: cdk.aws_lambda.IFunction;
    enabled?: boolean;
    scheduleExpression?: string;
    scheduleExpressionTimezone?: string;
  },
): cdk.aws_scheduler.CfnSchedule | undefined {
  if (!shouldCreateSeatoolStatusMismatchReportSchedule(stage, isDev)) {
    return undefined;
  }
  const scheduleEnabled = enabled ?? stage === "production";

  const scheduleRole = new cdk.aws_iam.Role(scope, "SeatoolStatusMismatchReportScheduleRole", {
    assumedBy: new cdk.aws_iam.ServicePrincipal("scheduler.amazonaws.com"),
    inlinePolicies: {
      SeatoolStatusMismatchReportSchedulePolicy: new cdk.aws_iam.PolicyDocument({
        statements: [
          new cdk.aws_iam.PolicyStatement({
            effect: cdk.aws_iam.Effect.ALLOW,
            actions: ["lambda:InvokeFunction"],
            resources: [runSeatoolStatusMismatchReportLambda.functionArn],
          }),
        ],
      }),
    },
  });

  return new cdk.aws_scheduler.CfnSchedule(scope, "SeatoolStatusMismatchReportDailySchedule", {
    description: "Run OneMAC to SEATool status mismatch report daily at 9 PM ET.",
    flexibleTimeWindow: {
      mode: "OFF",
    },
    name: `${project}-${stage}-${stack}-seatool-status-mismatch-daily`,
    scheduleExpression,
    scheduleExpressionTimezone,
    state: scheduleEnabled ? "ENABLED" : "DISABLED",
    target: {
      arn: runSeatoolStatusMismatchReportLambda.functionArn,
      input: JSON.stringify({
        source: "daily-seatool-status-mismatch-schedule",
      }),
      roleArn: scheduleRole.roleArn,
    },
  });
}
