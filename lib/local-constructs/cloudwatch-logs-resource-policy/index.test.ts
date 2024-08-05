import { describe, it, expect } from "vitest";
import * as cdk from "aws-cdk-lib";
import { CloudWatchLogsResourcePolicy } from ".";
import * as logs from "aws-cdk-lib/aws-logs";

describe("CloudWatchLogsResourcePolicy", () => {
  const app = new cdk.App();
  const stack = new cdk.Stack(app, "TestStack");
  const project = "testProject";

  const cloudWatchLogsResourcePolicy = new CloudWatchLogsResourcePolicy(
    stack,
    "CloudWatchLogsResourcePolicy",
    {
      project,
    },
  );

  it("should create a CloudWatch Logs resource policy with appropriate properties", () => {
    const policy = cloudWatchLogsResourcePolicy.policy;
    expect(policy).toBeInstanceOf(logs.CfnResourcePolicy);
    expect(policy.policyName).toBe(
      `${project}-centralized-logs-policy-CloudWatchLogsResourcePolicy`,
    );
    const policyDocument = JSON.parse(policy.policyDocument);
    expect(policyDocument.Version).toBe("2012-10-17");
    expect(policyDocument.Statement).toHaveLength(1);
    const statement = policyDocument.Statement[0];
    expect(statement.Effect).toBe("Allow");
    expect(statement.Principal.Service).toBe("delivery.logs.amazonaws.com");
    expect(statement.Action).toContain("logs:CreateLogStream");
    expect(statement.Action).toContain("logs:PutLogEvents");
  });
});
