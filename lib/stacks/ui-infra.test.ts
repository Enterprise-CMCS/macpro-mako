import * as cdk from "aws-cdk-lib";
import { Template } from "aws-cdk-lib/assertions";
import { readFileSync } from "fs";
import { join } from "path";
import { describe, expect, it } from "vitest";

import { UiInfra } from "./ui-infra";

function buildUiInfraTemplate() {
  const app = new cdk.App();
  const stack = new cdk.Stack(app, "UiInfraTest", {
    env: {
      account: "123456789012",
      region: "us-east-1",
    },
  });

  const uiInfra = new UiInfra(stack, "ui-infra", {
    project: "mako",
    stage: "val",
    stack: "ui-infra",
    isDev: false,
    domainName: "onemacval.cms.gov",
    domainCertificateArn:
      "arn:aws:acm:us-east-1:123456789012:certificate/00000000-0000-0000-0000-000000000000",
  });

  return Template.fromStack(uiInfra);
}

function getCloudFrontFunctionCode(template: Template) {
  const functions = template.findResources("AWS::CloudFront::Function");

  return Object.values(functions).map((resource) => {
    const properties = resource.Properties as { FunctionCode?: string };
    return properties.FunctionCode || "";
  });
}

function getDistributionConfig(template: Template) {
  const distributions = template.findResources("AWS::CloudFront::Distribution");
  const distribution = Object.values(distributions)[0] as {
    Properties?: {
      DistributionConfig?: unknown;
    };
  };

  return JSON.stringify(distribution.Properties?.DistributionConfig || {});
}

describe("UiInfra security remediations", () => {
  it("adds response headers that prevent MIME sniffing while preserving HSTS", () => {
    const functionCode = getCloudFrontFunctionCode(buildUiInfraTemplate()).join("\n");

    expect(functionCode).toContain("strict-transport-security");
    expect(functionCode).toContain("x-content-type-options");
    expect(functionCode).toContain("nosniff");
  });

  it("blocks backup-file probes before the SPA fallback can return index.html", () => {
    const functionCode = getCloudFrontFunctionCode(buildUiInfraTemplate()).join("\n");

    expect(functionCode).toContain(".bak");
    expect(functionCode).toContain("statusCode: 404");
    expect(functionCode).toContain("Backup file paths are not served");
  });

  it("attaches the backup block at viewer-request and headers at viewer-response", () => {
    const distributionConfig = getDistributionConfig(buildUiInfraTemplate());

    expect(distributionConfig).toContain("viewer-request");
    expect(distributionConfig).toContain("viewer-response");
  });

  it("does not ship jszip in the UI dependency graph", () => {
    const repoRoot = join(__dirname, "../..");
    const packageManifest = readFileSync(join(repoRoot, "react-app/package.json"), "utf8");
    const lockfile = readFileSync(join(repoRoot, "bun.lockb")).toString("utf8");

    expect(packageManifest.toLowerCase()).not.toContain("jszip");
    expect(lockfile.toLowerCase()).not.toContain("jszip");
  });
});
