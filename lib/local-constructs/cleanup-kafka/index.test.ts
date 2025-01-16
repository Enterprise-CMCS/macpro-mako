import { describe, it, expect } from "vitest";
import * as cdk from "aws-cdk-lib";
import { CleanupKafka } from ".";
import * as logs from "aws-cdk-lib/aws-logs";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as ec2 from "aws-cdk-lib/aws-ec2";
import * as iam from "aws-cdk-lib/aws-iam";
import * as cr from "aws-cdk-lib/custom-resources";

describe("CleanupKafka", () => {
  const app = new cdk.App();
  const stack = new cdk.Stack(app, "TestStack");

  // Mock properties
  const vpc = new ec2.Vpc(stack, "Vpc");
  const privateSubnets = [
    new ec2.PrivateSubnet(stack, "PrivateSubnet", {
      vpcId: vpc.vpcId,
      availabilityZone: "us-west-2a",
    }),
  ];
  const securityGroups = [new ec2.SecurityGroup(stack, "SecurityGroup", { vpc })];
  const brokerString = "mockBrokerString";
  const topicPatternsToDelete = ["mockTopicPattern"];

  const cleanupKafka = new CleanupKafka(stack, "CleanupKafka", {
    vpc,
    privateSubnets,
    securityGroups,
    brokerString,
    topicPatternsToDelete,
  });

  it("should create a log group for the Lambda function", () => {
    const logGroup = cleanupKafka.node.findChild("cleanupKafkaLogGroup") as logs.LogGroup;
    expect(logGroup).toBeInstanceOf(logs.LogGroup);
  });

  it("should create a Lambda function with appropriate properties", () => {
    const lambdaFunction = cleanupKafka.node.findChild(
      "CleanupKafkaLambdaFunction",
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

  it("should create a custom resource to invoke the Lambda function", () => {
    const customResource = cleanupKafka.node.findChild(
      "CleanupKafkaCustomResource",
    ) as cr.AwsCustomResource;
    expect(customResource).toBeInstanceOf(cr.AwsCustomResource);

    const customResourceLogGroup = cleanupKafka.node.findChild(
      "cleanupKafkaCustomResourceLogGroup",
    ) as logs.LogGroup;
    expect(customResourceLogGroup).toBeInstanceOf(logs.LogGroup);
  });
});
