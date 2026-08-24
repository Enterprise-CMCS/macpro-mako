import * as cdk from "aws-cdk-lib";
import { Template } from "aws-cdk-lib/assertions";
import { describe, expect, it, vi } from "vitest";

import { Data } from "./data";

vi.setConfig({ testTimeout: 180_000, hookTimeout: 180_000 });

interface StageFixture {
  stage: string;
  isDev: boolean;
}

interface CfnResource {
  Type: string;
  Properties?: Record<string, unknown>;
}

const STAGE_FIXTURES: StageFixture[] = [
  { stage: "feature-smart-events", isDev: true },
  { stage: "main", isDev: false },
  { stage: "val", isDev: false },
  { stage: "production", isDev: false },
];

const BROKER_STRING = "broker-one.example.com:9092,broker-two.example.com:9092";
const templates = new Map<string, Template>();

function buildDataTemplate({ stage, isDev }: StageFixture): Template {
  const cachedTemplate = templates.get(stage);
  if (cachedTemplate) {
    return cachedTemplate;
  }

  const app = new cdk.App();
  const parent = new cdk.Stack(app, `DataSmartEventsParent-${stage}`, {
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
    isDev,
    attachmentArchiveRebuildQueue,
    vpc,
    privateSubnets: vpc.privateSubnets,
    brokerString: BROKER_STRING,
    lambdaSecurityGroup,
    topicNamespace: isDev ? `--mako--${stage}--` : "",
    indexNamespace: stage,
    devPasswordArn: "arn:aws:secretsmanager:us-east-1:123456789012:secret:mako-test-password",
    sharedOpenSearchDomainArn: "arn:aws:es:us-east-1:123456789012:domain/mako-shared-opensearch",
    sharedOpenSearchDomainEndpoint: "search-mako-shared-opensearch.us-east-1.es.amazonaws.com",
  });
  const template = Template.fromStack(dataStack);

  templates.set(stage, template);
  return template;
}

function getResources(template: Template): Record<string, CfnResource> {
  return template.toJSON().Resources as Record<string, CfnResource>;
}

function findResource(
  template: Template,
  type: string,
  predicate: (properties: Record<string, unknown>) => boolean,
): [string, CfnResource] | undefined {
  return Object.entries(getResources(template)).find(
    ([, resource]) => resource.Type === type && predicate(resource.Properties ?? {}),
  );
}

function getSmartLambda(template: Template, stage: string): [string, CfnResource] {
  const smartLambda = findResource(
    template,
    "AWS::Lambda::Function",
    (properties) => properties.FunctionName === `mako-${stage}-data-sinkSmart`,
  );

  expect(smartLambda, "dedicated sinkSmart Lambda").toBeDefined();
  return smartLambda!;
}

function getSmartEventSourceMapping(template: Template, smartTopic: string): [string, CfnResource] {
  const mapping = findResource(template, "AWS::Lambda::EventSourceMapping", (properties) =>
    Array.isArray(properties.Topics)
      ? (properties.Topics as unknown[]).includes(smartTopic)
      : false,
  );

  expect(mapping, "standalone SMART event source mapping").toBeDefined();
  return mapping!;
}

function getRoleLogicalId(lambdaResource: CfnResource): string {
  const role = lambdaResource.Properties?.Role as {
    "Fn::GetAtt"?: [string, string];
  };
  const roleLogicalId = role?.["Fn::GetAtt"]?.[0];

  expect(roleLogicalId, "sinkSmart execution role").toBeDefined();
  return roleLogicalId!;
}

function getRolePolicyStatements(template: Template, roleLogicalId: string): unknown[] {
  const resources = getResources(template);
  const attachedPolicyStatements = Object.values(resources)
    .filter(
      (resource) =>
        resource.Type === "AWS::IAM::Policy" &&
        JSON.stringify(resource.Properties?.Roles).includes(roleLogicalId),
    )
    .flatMap((resource) => {
      const policyDocument = resource.Properties?.PolicyDocument as {
        Statement?: unknown[];
      };
      return policyDocument.Statement ?? [];
    });
  const rolePolicies = resources[roleLogicalId]?.Properties?.Policies as
    | Array<{ PolicyDocument?: { Statement?: unknown[] } }>
    | undefined;
  const inlinePolicyStatements =
    rolePolicies?.flatMap((policy) => policy.PolicyDocument?.Statement ?? []) ?? [];

  return [...attachedPolicyStatements, ...inlinePolicyStatements];
}

function getRoleManagedPolicyArns(template: Template, roleLogicalId: string): string {
  return JSON.stringify(getResources(template)[roleLogicalId]?.Properties?.ManagedPolicyArns ?? []);
}

describe.each(STAGE_FIXTURES)("Data SMART events infrastructure for $stage", ({ stage, isDev }) => {
  const topicNamespace = isDev ? `--mako--${stage}--` : "";
  const cdcTopic = `${topicNamespace}aws.onemac.migration.cdc`;
  const smartTopic = `${topicNamespace}aws.mulesoft.onemac.events`;
  it("creates the namespaced SMART topic wherever CDC is created", () => {
    const template = buildDataTemplate({ stage, isDev });
    const serializedTemplate = JSON.stringify(template.toJSON());

    expect(serializedTemplate).toContain(cdcTopic);
    expect(serializedTemplate).toContain(smartTopic);
  });

  it("uses a dedicated Lambda and standalone LATEST SMART consumer", () => {
    const template = buildDataTemplate({ stage, isDev });
    const [smartLambdaLogicalId] = getSmartLambda(template, stage);
    const [, mapping] = getSmartEventSourceMapping(template, smartTopic);
    const mappingProperties = mapping.Properties!;
    const consumerGroupConfig = mappingProperties.SelfManagedKafkaEventSourceConfig as {
      ConsumerGroupId?: string;
    };

    expect(mappingProperties.StartingPosition).toBe("LATEST");
    expect(consumerGroupConfig?.ConsumerGroupId).toMatch(/[Ss][Mm][Aa][Rr][Tt]/);
    expect(JSON.stringify(mappingProperties.FunctionName)).toContain(smartLambdaLogicalId);
  });

  it("keeps SMART out of CDC, changelog, email, and reindex mappings", () => {
    const template = buildDataTemplate({ stage, isDev });
    const [smartLambdaLogicalId] = getSmartLambda(template, stage);
    const [smartMappingLogicalId, smartMapping] = getSmartEventSourceMapping(template, smartTopic);
    const resources = getResources(template);
    const nonSmartMappings = Object.entries(resources).filter(
      ([logicalId, resource]) =>
        resource.Type === "AWS::Lambda::EventSourceMapping" && logicalId !== smartMappingLogicalId,
    );
    const reindexStateMachines = Object.values(resources).filter(
      (resource) => resource.Type === "AWS::StepFunctions::StateMachine",
    );

    expect(smartMapping.Properties?.Topics).toEqual([smartTopic]);
    expect(JSON.stringify(smartMapping.Properties)).not.toContain(cdcTopic);
    expect(JSON.stringify(smartMapping.Properties)).not.toMatch(
      /sinkMain|sinkChangelog|processEmails|createTriggers/,
    );
    for (const [, mapping] of nonSmartMappings) {
      expect(JSON.stringify(mapping.Properties)).not.toContain(smartTopic);
      expect(JSON.stringify(mapping.Properties?.FunctionName)).not.toContain(smartLambdaLogicalId);
    }
    expect(JSON.stringify(reindexStateMachines)).not.toContain(smartTopic);
    expect(JSON.stringify(reindexStateMachines)).not.toContain(smartLambdaLogicalId);
  });

  it("does not create a collision log group or pass collision destinations", () => {
    const template = buildDataTemplate({ stage, isDev });
    const [, smartLambda] = getSmartLambda(template, stage);
    const environment = smartLambda.Properties?.Environment as {
      Variables?: Record<string, string>;
    };
    const roleLogicalId = getRoleLogicalId(smartLambda);
    const statements = getRolePolicyStatements(template, roleLogicalId);
    const serializedTemplate = JSON.stringify(template.toJSON());

    expect(serializedTemplate).not.toContain("smart-onemac-collisions");
    expect(environment?.Variables).not.toHaveProperty("SMART_COLLISION_LOG_GROUP");
    expect(environment?.Variables).not.toHaveProperty("SMART_COLLISION_LOG_STREAM");
    expect(
      JSON.stringify({
        role: getResources(template)[roleLogicalId],
        statements,
      }).toLowerCase(),
    ).not.toContain("ses:");
  });

  it("grants sinkSmart the VPC ENI managed policies required to create the function", () => {
    const template = buildDataTemplate({ stage, isDev });
    const [, smartLambda] = getSmartLambda(template, stage);
    const roleLogicalId = getRoleLogicalId(smartLambda);
    const managedPolicyArns = getRoleManagedPolicyArns(template, roleLogicalId);
    const statements = getRolePolicyStatements(template, roleLogicalId);
    const describeStatement = statements.find((statement) => {
      const actions = (statement as { Action?: string | string[] }).Action;
      const actionList = Array.isArray(actions) ? actions : [actions];
      return actionList.includes("ec2:DescribeSubnets");
    });

    expect(managedPolicyArns).toContain("AWSLambdaBasicExecutionRole");
    expect(managedPolicyArns).toContain("AWSLambdaVPCAccessExecutionRole");
    expect(describeStatement, "self-managed Kafka ESM subnet lookup").toBeDefined();
  });
});
