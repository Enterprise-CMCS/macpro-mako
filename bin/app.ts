#!/usr/bin/env node
import "source-map-support/register";
import * as cdk from "aws-cdk-lib";
import { ParentStack } from "../lib/parent-stack";
import { fetchSecret } from "../lib/utils/fetchSecret";

async function main() {
  try {
    const app = new cdk.App();

    const project = validateEnvVariable("PROJECT");
    const region = validateEnvVariable("REGION_A");
    const stage = app.node.tryGetContext("stage");

    const vpcInfo = await fetchSecret(project, stage, "vpc");
    const brokerString = await fetchSecret(project, stage, "brokerString");
    const onemacLegacyS3AccessRoleArn = await fetchSecret(
      project,
      stage,
      "onemacLegacyS3AccessRoleArn"
    );
    const dbInfo = await fetchSecret(project, stage, "seatool/dbInfo");
    const launchdarklySDKKey = await fetchSecret(
      project,
      stage,
      "launchdarklySDKKey"
    );
    const idmInfo = await fetchSecret(project, stage, "idmInfo");

    cdk.Tags.of(app).add("PROJECT", project);
    cdk.Tags.of(app).add("STAGE", stage);

    const env = {
      account: process.env.CDK_DEFAULT_ACCOUNT,
      region: process.env.CDK_DEFAULT_REGION,
    };

    new ParentStack(app, `${project}-${stage}`, {
      env,
      project,
      stage,
      vpcInfo,
      brokerString,
      onemacLegacyS3AccessRoleArn,
      dbInfo,
      launchdarklySDKKey,
      idmInfo,
    });

    app.synth();
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  }
}
main();

// Fail out if environment variable isn't set
function validateEnvVariable(variableName: string): string {
  const value = process.env[variableName];
  if (!value || typeof value !== "string" || value.trim() === "") {
    console.error(
      `ERROR: Environment variable ${variableName} must be set and be a non-empty string.`
    );
    process.exit(1);
  }
  return value;
}
