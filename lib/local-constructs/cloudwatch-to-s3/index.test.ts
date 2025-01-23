import { describe, it, expect } from "vitest";
import * as cdk from "aws-cdk-lib";
import { CloudWatchToS3 } from ".";
import * as logs from "aws-cdk-lib/aws-logs";
import * as iam from "aws-cdk-lib/aws-iam";
import * as firehose from "aws-cdk-lib/aws-kinesisfirehose";

describe("CloudWatchToS3", () => {
  const app = new cdk.App();
  const stack = new cdk.Stack(app, "TestStack");
  const logGroup = new logs.LogGroup(stack, "LogGroup");

  const bucket = new cdk.aws_s3.Bucket(stack, "Bucket", {
    versioned: true,
    removalPolicy: cdk.RemovalPolicy.DESTROY,
  });

  const cloudWatchToS3 = new CloudWatchToS3(stack, "CloudWatchToS3", {
    logGroup,
    bucket,
  });

  it("should create a Firehose delivery stream with appropriate properties", () => {
    const deliveryStream = cloudWatchToS3.deliveryStream;
    expect(deliveryStream).toBeInstanceOf(firehose.CfnDeliveryStream);
    expect(deliveryStream.deliveryStreamType).toBe("DirectPut");

    const s3DestConfig =
      deliveryStream.extendedS3DestinationConfiguration as firehose.CfnDeliveryStream.ExtendedS3DestinationConfigurationProperty;
    expect(s3DestConfig.bucketArn).toBe(bucket.bucketArn);
  });

  it("should create IAM roles with appropriate policies", () => {
    const firehoseRole = cloudWatchToS3.node.findChild("FirehoseRole") as iam.Role;
    expect(firehoseRole).toBeInstanceOf(iam.Role);

    const policyDocument = firehoseRole.assumeRolePolicy?.toJSON() as iam.PolicyDocumentProps;
    const statement = policyDocument.Statement.find((s) => s.Principal && s.Principal.Service);
    expect(statement).toBeDefined();
    expect(statement.Principal.Service).toContain("firehose.amazonaws.com");

    const policy = firehoseRole.node.tryFindChild("DefaultPolicy") as iam.Policy;
    const statements = policy.document.statements;
    expect(statements).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          actions: ["s3:PutObject", "s3:PutObjectAcl"],
          resources: [`${bucket.bucketArn}/*`],
        }),
        expect.objectContaining({
          actions: ["logs:PutLogEvents", "logs:CreateLogGroup"],
          resources: [
            `arn:aws:logs:${cdk.Stack.of(cloudWatchToS3).region}:${
              cdk.Stack.of(cloudWatchToS3).account
            }:log-group:/aws/kinesisfirehose/*`,
          ],
        }),
      ]),
    );
  });

  it("should create a CloudWatch subscription filter to send logs to Firehose", () => {
    const subscriptionFilter = cloudWatchToS3.node.findChild(
      "SubscriptionFilter",
    ) as logs.CfnSubscriptionFilter;
    expect(subscriptionFilter).toBeInstanceOf(logs.CfnSubscriptionFilter);
    expect(subscriptionFilter.logGroupName).toBe(logGroup.logGroupName);
  });
});
