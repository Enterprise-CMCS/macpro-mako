import { describe, it, expect } from "vitest";
import * as cdk from "aws-cdk-lib";
import { WafConstruct, CloudFrontWaf, RegionalWaf } from ".";
import * as logs from "aws-cdk-lib/aws-logs";
import * as wafv2 from "aws-cdk-lib/aws-wafv2";
import * as apigateway from "aws-cdk-lib/aws-apigateway";

describe("WafConstruct", () => {
  const app = new cdk.App();
  const stack = new cdk.Stack(app, "TestStack");

  const props = {
    name: "test-waf",
    rateLimit: 1000,
    awsCommonExcludeRules: ["CommonRule1"],
    awsIpReputationExcludeRules: ["IpReputationRule1"],
    awsBadInputsExcludeRules: ["BadInputsRule1"],
  };

  const wafConstruct = new WafConstruct(
    stack,
    "WafConstruct",
    props,
    "REGIONAL",
  );

  it("should create a log group with appropriate properties", () => {
    const logGroup = wafConstruct.logGroup;
    expect(logGroup).toBeInstanceOf(logs.LogGroup);
  });

  it("should create a WebACL with appropriate properties", () => {
    const webAcl = wafConstruct.webAcl;
    expect(webAcl).toBeInstanceOf(wafv2.CfnWebACL);
    expect(webAcl.scope).toBe("REGIONAL");
    expect(webAcl.name).toBe(props.name);
    expect(webAcl.defaultAction.block).toBeDefined();
    expect(webAcl.visibilityConfig.cloudWatchMetricsEnabled).toBe(true);
    expect(webAcl.visibilityConfig.sampledRequestsEnabled).toBe(true);
    expect(webAcl.visibilityConfig.metricName).toBe(`${props.name}-webacl`);
  });

  it("should create a logging configuration with appropriate properties", () => {
    const loggingConfiguration = stack.node
      .findChild("WafConstruct")
      .node.findChild("LoggingConfiguration") as wafv2.CfnLoggingConfiguration;
    expect(loggingConfiguration).toBeInstanceOf(wafv2.CfnLoggingConfiguration);
    expect(loggingConfiguration.resourceArn).toBe(wafConstruct.webAcl.attrArn);
    expect(loggingConfiguration.logDestinationConfigs).toContain(
      wafConstruct.logGroup.logGroupArn,
    );
  });
});

describe("CloudFrontWaf", () => {
  const app = new cdk.App();
  const stack = new cdk.Stack(app, "TestStack");

  const props = {
    name: "test-waf",
    rateLimit: 1000,
    awsCommonExcludeRules: ["CommonRule1"],
    awsIpReputationExcludeRules: ["IpReputationRule1"],
    awsBadInputsExcludeRules: ["BadInputsRule1"],
  };

  const cloudFrontWaf = new CloudFrontWaf(stack, "CloudFrontWaf", props);

  it("should create a WebACL with CLOUDFRONT scope", () => {
    const webAcl = cloudFrontWaf.webAcl;
    expect(webAcl).toBeInstanceOf(wafv2.CfnWebACL);
    expect(webAcl.scope).toBe("CLOUDFRONT");
  });
});

describe("RegionalWaf", () => {
  const app = new cdk.App();
  const stack = new cdk.Stack(app, "TestStack");

  const apiGateway = new apigateway.RestApi(stack, "ApiGateway", {
    restApiName: "test-api",
  });

  const props = {
    name: "test-waf",
    rateLimit: 1000,
    awsCommonExcludeRules: ["CommonRule1"],
    awsIpReputationExcludeRules: ["IpReputationRule1"],
    awsBadInputsExcludeRules: ["BadInputsRule1"],
    apiGateway: apiGateway,
  };

  const regionalWaf = new RegionalWaf(stack, "RegionalWaf", props);

  it("should create a WebACL with REGIONAL scope", () => {
    const webAcl = regionalWaf.webAcl;
    expect(webAcl).toBeInstanceOf(wafv2.CfnWebACL);
    expect(webAcl.scope).toBe("REGIONAL");
  });

  it("should associate the WebACL with the API Gateway", () => {
    const webAclAssociation = stack.node
      .findChild("RegionalWaf")
      .node.findChild("WebACLAssociation") as wafv2.CfnWebACLAssociation;
    expect(webAclAssociation).toBeInstanceOf(wafv2.CfnWebACLAssociation);
    expect(webAclAssociation.resourceArn).toBe(
      apiGateway.deploymentStage.stageArn,
    );
    expect(webAclAssociation.webAclArn).toBe(regionalWaf.webAcl.attrArn);
  });
});
