#!/usr/bin/env node
import "source-map-support/register";
import * as cdk from "aws-cdk-lib";
import { ParentStack } from "../lib/parent-stack";
import { DeploymentConfig } from "../lib/deployment-config";

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

function validateEnvVariable(variableName: string): string {
  const value = process.env[variableName];
  if (!value || typeof value !== "string" || value.trim() === "") {
    console.error(
      `ERROR: Environment variable ${variableName} must be set and be a non-empty string.`,
    );
    process.exit(1);
  }
  return value;
}
