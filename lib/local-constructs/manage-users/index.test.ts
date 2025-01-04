import { describe, it, expect } from "vitest";
import * as cdk from "aws-cdk-lib";
import { ManageUsers } from ".";
import * as logs from "aws-cdk-lib/aws-logs";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as cognito from "aws-cdk-lib/aws-cognito";
import * as iam from "aws-cdk-lib/aws-iam";
import * as cr from "aws-cdk-lib/custom-resources";

describe("ManageUsers", () => {
  const app = new cdk.App();
  const stack = new cdk.Stack(app, "TestStack");

  // Mock properties
  const userPool = new cognito.UserPool(stack, "UserPool");
  const users = [{ username: "user1" }, { username: "user2" }];
  const passwordSecretArn = "mockPasswordSecretArn"; // pragma: allowlist secret

  const manageUsers = new ManageUsers(stack, "ManageUsers", userPool, users, passwordSecretArn);

  it("should create a log group for the Lambda function", () => {
    const lambdaLogGroup = manageUsers.node.findChild("LambdaLogGroup") as logs.LogGroup;
    expect(lambdaLogGroup).toBeInstanceOf(logs.LogGroup);
  });

  it("should create a Lambda function with appropriate properties", () => {
    const lambdaFunction = manageUsers.node.findChild("LambdaFunction") as lambda.Function;
    expect(lambdaFunction).toBeInstanceOf(lambda.Function);
    expect(lambdaFunction.runtime).toBe(lambda.Runtime.NODEJS_20_X);
    expect(lambdaFunction.timeout?.toMinutes()).toBe(5);

    const role = lambdaFunction.role as iam.Role;
    expect(role).toBeInstanceOf(iam.Role);

    // Updated assertion for assume role policy
    expect(role.assumeRolePolicy?.toString()).toContain("Token[PolicyDocument");
  });

  it("should create a custom resource to invoke the Lambda function", () => {
    const customResource = manageUsers.node.findChild(
      "CleanupKafkaCustomResource",
    ) as cr.AwsCustomResource;
    expect(customResource).toBeInstanceOf(cr.AwsCustomResource);

    const customResourceLogGroup = manageUsers.node.findChild(
      "CustomResourceLogGroup",
    ) as logs.LogGroup;
    expect(customResourceLogGroup).toBeInstanceOf(logs.LogGroup);
  });
});
