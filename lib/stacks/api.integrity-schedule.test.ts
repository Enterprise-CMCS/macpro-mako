import * as cdk from "aws-cdk-lib";
import { Template } from "aws-cdk-lib/assertions";
import { describe, it } from "vitest";

import { Api } from "./api";
import { getLegacyAttachmentBucketMapParameterName } from "./legacy-attachment-bucket-map";

function buildApiTemplate({ stage, isDev }: { stage: string; isDev: boolean }) {
  const app = new cdk.App();
  const stack = new cdk.Stack(app, `ApiIntegrity${stage}`, {
    env: {
      account: "123456789012",
      region: "us-east-1",
    },
  });

  const vpc = new cdk.aws_ec2.Vpc(stack, `Vpc${stage}`, {
    maxAzs: 2,
  });
  const privateSubnets = vpc.privateSubnets.slice(0, 2);
  const lambdaSecurityGroup = new cdk.aws_ec2.SecurityGroup(stack, `LambdaSg${stage}`, {
    vpc,
  });
  const attachmentArchiveRebuildQueue = new cdk.aws_sqs.Queue(stack, `ArchiveQueue${stage}`, {
    queueName: `mako-${stage}-archive-rebuild.fifo`,
    fifo: true,
    contentBasedDeduplication: true,
  });
  const alertsTopic = new cdk.aws_sns.Topic(stack, `AlertsTopic${stage}`);
  const attachmentsBucket = new cdk.aws_s3.Bucket(stack, `AttachmentsBucket${stage}`);

  new cdk.aws_ssm.StringParameter(stack, `LegacyMapParam${stage}`, {
    parameterName: getLegacyAttachmentBucketMapParameterName("mako", stage),
    stringValue: "{}",
  });

  const apiStack = new Api(stack, `Api${stage}`, {
    project: "mako",
    stage,
    stack: "api",
    isDev,
    attachmentArchiveRebuildQueue,
    vpc,
    privateSubnets,
    lambdaSecurityGroup,
    topicNamespace: "",
    indexNamespace: stage,
    openSearchDomainArn: "arn:aws:es:us-east-1:123456789012:domain/test-domain",
    openSearchDomainEndpoint: "search-test-domain.us-east-1.es.amazonaws.com",
    alertsTopic,
    attachmentsBucket,
    brokerString: "broker-1:9092,broker-2:9092",
    dbInfoSecretName: "mako-db",
    legacyS3AccessRoleArn: "arn:aws:iam::123456789012:role/test-legacy-role",
    emailAddressLookupSecretName: "emailAddresses",
    notificationSecretName: "mako-main",
    notificationSecretArn:
      "arn:aws:secretsmanager:us-east-1:123456789012:secret:mako-main-notifications",
  });

  return Template.fromStack(apiStack);
}

describe("Api attachment archive integrity scheduling", () => {
  for (const stage of ["main", "val", "production"] as const) {
    it(`creates the daily integrity schedule with ET timezone for ${stage}`, () => {
      const template = buildApiTemplate({
        stage,
        isDev: false,
      });

      template.hasResourceProperties("AWS::Scheduler::Schedule", {
        ScheduleExpression: "cron(0 2 * * ? *)",
        ScheduleExpressionTimezone: "America/New_York",
        State: "ENABLED",
      });
      template.hasResourceProperties("AWS::Lambda::Function", {
        FunctionName: `mako-${stage}-api-runAttachmentArchiveIntegrityCheck`,
      });
      template.hasResourceProperties("AWS::Lambda::Function", {
        FunctionName: `mako-${stage}-api-notifyAttachmentArchiveIntegrity`,
      });
    }, 30000);
  }

  it("does not create a daily integrity schedule for non-shared stages", () => {
    const template = buildApiTemplate({
      stage: "featurea",
      isDev: false,
    });

    template.resourceCountIs("AWS::Scheduler::Schedule", 0);
  }, 30000);
});
