import * as cdk from "aws-cdk-lib";
import { Match, Template } from "aws-cdk-lib/assertions";
import { describe, expect, it, vi } from "vitest";

import { Data } from "./data";

vi.setConfig({ testTimeout: 180_000, hookTimeout: 180_000 });

function buildDataTemplate({
  stage,
  shared,
}: {
  stage: string;
  shared: boolean;
}): Template {
  const app = new cdk.App();
  const parent = new cdk.Stack(app, `DataOpenSearchMasterParent-${stage}-${shared}`, {
    env: {
      account: "123456789012",
      region: "us-east-1",
    },
  });
  const privateSubnetIds = ["subnet-00000001", "subnet-00000002", "subnet-00000003"];
  const vpc = cdk.aws_ec2.Vpc.fromVpcAttributes(parent, `Vpc-${stage}`, {
    availabilityZones: ["us-east-1a", "us-east-1b", "us-east-1c"],
    privateSubnetIds,
    vpcId: "vpc-00000001",
  });
  const attachmentArchiveRebuildQueue = new cdk.aws_sqs.Queue(
    parent,
    `AttachmentArchiveRebuildQueue-${stage}`,
  );
  const lambdaSecurityGroup = cdk.aws_ec2.SecurityGroup.fromSecurityGroupId(
    parent,
    `LambdaSecurityGroup-${stage}`,
    "sg-00000001",
  );

  const dataStack = new Data(parent, `data-${stage}`, {
    project: "mako",
    stage,
    stack: "data",
    isDev: true,
    attachmentArchiveRebuildQueue,
    vpc,
    privateSubnets: vpc.privateSubnets,
    brokerString: "broker-one.example.com:9092",
    lambdaSecurityGroup,
    topicNamespace: `--mako--${stage}--`,
    indexNamespace: stage,
    devPasswordArn: "arn:aws:secretsmanager:us-east-1:123456789012:secret:mako-test-password",
    sharedOpenSearchDomainArn: shared
      ? "arn:aws:es:us-east-1:123456789012:domain/mako-shared-opensearch"
      : "",
    sharedOpenSearchDomainEndpoint: shared
      ? "search-mako-shared-opensearch.us-east-1.es.amazonaws.com"
      : "",
    bigmacErrorQueueUrl: "",
    bigmacErrorQueueArn: "",
  });

  return Template.fromStack(dataStack);
}

describe("OpenSearch master role", () => {
  it("does not create OpenSearchMasterRole when using a shared domain", () => {
    const template = buildDataTemplate({ stage: "main", shared: true });
    const roles = template.findResources("AWS::IAM::Role");
    const masterRoles = Object.values(roles).filter((role) =>
      JSON.stringify(role).includes("OpenSearchMasterRole"),
    );
    expect(masterRoles).toHaveLength(0);
  });

  it("trusts the map-role Lambda and scopes es:ESHttp on the self-managed domain", () => {
    const template = buildDataTemplate({ stage: "feature-os-master", shared: false });

    template.hasResourceProperties("AWS::IAM::Role", {
      AssumeRolePolicyDocument: {
        Statement: Match.arrayWith([
          Match.objectLike({
            Action: "sts:AssumeRole",
            Effect: "Allow",
            Principal: {
              AWS: Match.anyValue(),
            },
          }),
        ]),
      },
    });

    const roles = Object.values(template.findResources("AWS::IAM::Role"));
    const masterRole = roles.find((role) => {
      const policies = (role.Properties as { ManagedPolicyArns?: string[] })?.ManagedPolicyArns;
      return policies?.some((arn) => arn.includes("AmazonOpenSearchServiceFullAccess"));
    });
    expect(masterRole).toBeUndefined();

    const trustDocuments = roles.map((role) =>
      JSON.stringify((role.Properties as { AssumeRolePolicyDocument?: unknown })?.AssumeRolePolicyDocument),
    );
    expect(trustDocuments.some((doc) => doc.includes('"AWS":"arn:aws:iam::123456789012:root"'))).toBe(
      false,
    );
    expect(trustDocuments.some((doc) => doc.includes("AccountPrincipal"))).toBe(false);

    template.hasResourceProperties("AWS::IAM::Policy", {
      PolicyDocument: {
        Statement: Match.arrayWith([
          Match.objectLike({
            Action: Match.arrayWith(["es:ESHttpGet", "es:ESHttpPut"]),
            Effect: "Allow",
          }),
        ]),
      },
    });
  });
});
