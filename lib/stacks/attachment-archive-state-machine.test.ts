import * as cdk from "aws-cdk-lib";
import { Template } from "aws-cdk-lib/assertions";
import { describe, expect, it } from "vitest";

import {
  ATTACHMENT_ARCHIVE_WORKER_TASK_TIMEOUT,
  createAttachmentArchiveStateMachine,
} from "./attachment-archive-state-machine";

function createInlineLambda(
  stack: cdk.Stack,
  id: string,
  functionName: string,
): cdk.aws_lambda.Function {
  return new cdk.aws_lambda.Function(stack, id, {
    runtime: cdk.aws_lambda.Runtime.NODEJS_20_X,
    handler: "index.handler",
    code: cdk.aws_lambda.Code.fromInline("exports.handler = async () => ({ status: 'ok' });"),
    functionName,
  });
}

describe("Attachment archive state machine", () => {
  it("renders a 15 minute task timeout and preserves the failure catch path", () => {
    const app = new cdk.App();
    const stack = new cdk.Stack(app, "AttachmentArchiveStateMachineTest", {
      env: {
        account: "123456789012",
        region: "us-east-1",
      },
    });
    const vpc = new cdk.aws_ec2.Vpc(stack, "Vpc", {
      maxAzs: 1,
      natGateways: 0,
    });
    const lambdaSecurityGroup = new cdk.aws_ec2.SecurityGroup(stack, "LambdaSecurityGroup", {
      vpc,
    });

    createAttachmentArchiveStateMachine(stack, {
      project: "mako",
      stage: "main",
      stack: "api",
      vpc,
      privateSubnets: vpc.privateSubnets,
      lambdaSecurityGroup,
      attachmentsBucketArn: "arn:aws:s3:::mako-main-attachments-123456789012",
      sharedAttachmentReadBucketArn: "arn:aws:s3:::mako-main-attachments-123456789012",
      legacyMirrorBucketArns: [
        "arn:aws:s3:::mako-main-legacy-attachments-123456789012",
        "arn:aws:s3:::mako-main-legacy-attachmentsbucket-123456789012",
      ],
      archiveWriteBucketArn: "arn:aws:s3:::mako-main-attachment-archives-123456789012",
      legacyS3AccessRoleArn: "arn:aws:iam::123456789012:role/test-legacy-role",
      legacyAttachmentBucketMap: "{}",
      archiveWorkerImage: cdk.aws_ecs.ContainerImage.fromRegistry(
        "public.ecr.aws/docker/library/alpine:latest",
      ),
      markAttachmentArchiveFailedLambda: createInlineLambda(
        stack,
        "MarkAttachmentArchiveFailed",
        "mako-main-api-markAttachmentArchiveFailed",
      ),
      validateAttachmentArchiveLambda: createInlineLambda(
        stack,
        "ValidateAttachmentArchive",
        "mako-main-api-validateAttachmentArchive",
      ),
    });

    const template = Template.fromStack(stack);
    const stateMachines = template.findResources("AWS::StepFunctions::StateMachine", {
      Properties: {
        StateMachineName: "mako-main-api-attachment-archive",
      },
    });
    const stateMachine = Object.values(stateMachines)[0] as {
      Properties?: {
        DefinitionString?: {
          "Fn::Join"?: [string, Array<string | Record<string, unknown>>];
        };
      };
    };
    expect(stateMachine).toBeDefined();
    const definitionParts = stateMachine.Properties?.DefinitionString?.["Fn::Join"]?.[1] || [];
    const definitionString = definitionParts
      .map((part) => (typeof part === "string" ? part : JSON.stringify(part)))
      .join("");

    expect(ATTACHMENT_ARCHIVE_WORKER_TASK_TIMEOUT.toSeconds()).toBe(900);
    expect(definitionString).toContain('"RunAttachmentArchiveWorkerTask"');
    expect(definitionString).toContain('"TimeoutSeconds":900');
    expect(definitionString).toContain('"Next":"MarkAttachmentArchiveFailedTask"');
    expect(definitionString).toContain('"ErrorEquals":["States.ALL"]');
  });
});
