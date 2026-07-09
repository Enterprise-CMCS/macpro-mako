import * as cdk from "aws-cdk-lib";
import { Match, Template } from "aws-cdk-lib/assertions";
import { describe, it } from "vitest";

import { Uploads } from "./uploads";

function buildUploadsTemplate() {
  const app = new cdk.App();
  const parentStack = new cdk.Stack(app, "UploadsParentTest", {
    env: {
      account: "123456789012",
      region: "us-east-1",
    },
  });

  const uploads = new Uploads(parentStack, "uploads", {
    project: "mako",
    stage: "main",
    stack: "uploads",
    isDev: false,
  });

  return Template.fromStack(uploads);
}

describe("Uploads stack", () => {
  it("configures ClamAV scanner throughput for bursty attachment uploads", () => {
    const template = buildUploadsTemplate();

    template.hasResourceProperties("AWS::Lambda::Function", {
      MemorySize: 10240,
      ReservedConcurrentExecutions: 5,
      Timeout: 180,
    });
    template.hasResourceProperties("AWS::SQS::Queue", {
      VisibilityTimeout: 240,
    });
    template.hasResourceProperties("AWS::Lambda::EventSourceMapping", {
      BatchSize: 1,
    });
  });

  it("keeps attachment downloads gated on clean virus scan tags", () => {
    const template = buildUploadsTemplate();

    template.hasResourceProperties("AWS::S3::BucketPolicy", {
      PolicyDocument: {
        Statement: Match.arrayWith([
          Match.objectLike({
            Effect: "Deny",
            Action: "s3:GetObject",
            Condition: {
              StringNotEquals: Match.objectLike({
                "s3:ExistingObjectTag/virusScanStatus": "CLEAN",
              }),
            },
          }),
        ]),
      },
    });
  });
});
