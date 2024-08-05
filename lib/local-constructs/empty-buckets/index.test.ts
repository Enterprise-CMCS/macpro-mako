import { describe, it, expect } from "vitest";
import * as cdk from "aws-cdk-lib";
import { EmptyBuckets } from ".";
import * as logs from "aws-cdk-lib/aws-logs";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as s3 from "aws-cdk-lib/aws-s3";
import * as iam from "aws-cdk-lib/aws-iam";
import * as cr from "aws-cdk-lib/custom-resources";

describe("EmptyBuckets", () => {
  const app = new cdk.App();
  const stack = new cdk.Stack(app, "TestStack");

  // Mock properties
  const bucket1 = new s3.Bucket(stack, "Bucket1");
  const bucket2 = new s3.Bucket(stack, "Bucket2");
  const buckets = [bucket1, bucket2];

  const emptyBuckets = new EmptyBuckets(stack, "EmptyBuckets", {
    buckets,
  });

  it("should create a log group for the Lambda function", () => {
    const lambdaLogGroup = emptyBuckets.node.findChild(
      "LambdaLogGroup",
    ) as logs.LogGroup;
    expect(lambdaLogGroup).toBeInstanceOf(logs.LogGroup);
  });

  it("should create a Lambda function with appropriate properties", () => {
    const lambdaFunction = emptyBuckets.node.findChild(
      "Lambda",
    ) as lambda.Function;
    expect(lambdaFunction).toBeInstanceOf(lambda.Function);
    expect(lambdaFunction.runtime).toBe(lambda.Runtime.NODEJS_18_X);
    expect(lambdaFunction.timeout?.toMinutes()).toBe(15);

    const role = lambdaFunction.role as iam.Role;
    expect(role).toBeInstanceOf(iam.Role);
    expect(role.assumeRolePolicy?.statements).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          principals: expect.arrayContaining([
            expect.objectContaining({
              service: "lambda.amazonaws.com",
            }),
          ]),
        }),
      ]),
    );
  });

  it("should grant read/write permissions to the Lambda function for the specified S3 buckets", () => {
    const role = emptyBuckets.node.findChild("LambdaRole") as iam.Role;
    expect(role).toBeInstanceOf(iam.Role);

    const policy = role.node.tryFindChild("DefaultPolicy") as iam.Policy;
    const statements = policy.document.statements;

    buckets.forEach((bucket) => {
      const statement = statements.find((s) => {
        return s.resources.includes(bucket.bucketArn);
      });
      expect(statement).toBeDefined();
      expect(statement.actions).toContain("s3:List*");
      expect(statement.actions).toContain("s3:DeleteObject*");
      expect(statement.resources).toContain(bucket.bucketArn);
    });
  });

  it("should create a custom resource to invoke the Lambda function", () => {
    const customResource = emptyBuckets.node.findChild(
      "CustomResource",
    ) as cr.AwsCustomResource;
    expect(customResource).toBeInstanceOf(cr.AwsCustomResource);

    const customResourceLogGroup = emptyBuckets.node.findChild(
      "CustomResourceLogGroup",
    ) as logs.LogGroup;
    expect(customResourceLogGroup).toBeInstanceOf(logs.LogGroup);
  });
});
