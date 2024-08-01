#!/usr/bin/env node
import "source-map-support/register";
import * as cdk from "aws-cdk-lib";
import { ParentStack } from "../lib/stacks/parent";
import { DeploymentConfig } from "../lib/stacks/deployment-config";
import { validateEnvVariable } from "shared-utils";

async function main() {
  try {
    const app = new cdk.App();

    validateEnvVariable("REGION_A");

    const project = validateEnvVariable("PROJECT");
    cdk.Tags.of(app).add("PROJECT", project);

    const stage = app.node.tryGetContext("stage");
    cdk.Tags.of(app).add("STAGE", stage);

    const deploymentConfig = await DeploymentConfig.fetch({ project, stage });

    new ParentStack(app, `${project}-${stage}`, {
      ...deploymentConfig.config,
      env: {
        account: process.env.CDK_DEFAULT_ACCOUNT,
        region: process.env.CDK_DEFAULT_REGION,
      },
    });
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  }
}

main();
