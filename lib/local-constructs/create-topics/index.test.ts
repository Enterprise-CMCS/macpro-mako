import { describe, it, expect } from "vitest";
import * as cdk from "aws-cdk-lib";
import { CreateTopics } from ".";
import * as logs from "aws-cdk-lib/aws-logs";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as ec2 from "aws-cdk-lib/aws-ec2";
import * as iam from "aws-cdk-lib/aws-iam";
import * as cr from "aws-cdk-lib/custom-resources";

describe("CreateTopics", () => {
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
  const topics = [{ topic: "mockTopic1" }, { topic: "mockTopic2" }];

  const createTopics = new CreateTopics(stack, "CreateTopics", {
    vpc,
    privateSubnets,
    securityGroups,
    brokerString,
    topics,
  });

  it("should create a log group for the Lambda function", () => {
    const lambdaLogGroup = createTopics.node.findChild("CreateTopicsLogGroup") as logs.LogGroup;
    expect(lambdaLogGroup).toBeInstanceOf(logs.LogGroup);
  });

  it("should create a Lambda function with appropriate properties", () => {
    const lambdaFunction = createTopics.node.findChild("CreateTopicsLambda") as lambda.Function;
    expect(lambdaFunction).toBeInstanceOf(lambda.Function);
    expect(lambdaFunction.runtime).toBe(lambda.Runtime.NODEJS_18_X);
    expect(lambdaFunction.timeout?.toMinutes()).toBe(5);

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
    const customResource = createTopics.node.findChild("CustomResource") as cr.AwsCustomResource;
    expect(customResource).toBeInstanceOf(cr.AwsCustomResource);

    const customResourceLogGroup = createTopics.node.findChild(
      "createTopicsCustomResourceLogGroup",
    ) as logs.LogGroup;
    expect(customResourceLogGroup).toBeInstanceOf(logs.LogGroup);
  });
});
