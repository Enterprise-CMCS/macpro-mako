#!/usr/bin/env node
import "source-map-support/register";
import * as cdk from "aws-cdk-lib";
import { ParentStack } from "../lib/stacks/parent";
import { DeploymentConfig } from "../lib/config/deployment-config";
import { getSecret, validateEnvVariable } from "shared-utils";
import {
  IamPathAspect,
  IamPermissionsBoundaryAspect,
} from "../lib/local-aspects";

async function main() {
  try {
    const app = new cdk.App({
      defaultStackSynthesizer: new cdk.DefaultStackSynthesizer(
        JSON.parse(await getSecret("cdkSynthesizerConfig")),
      ),
    });

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

    cdk.Aspects.of(app).add(
      new IamPermissionsBoundaryAspect(
        deploymentConfig.config.iamPermissionsBoundary,
      ),
    );
    cdk.Aspects.of(app).add(new IamPathAspect(deploymentConfig.config.iamPath));
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  }
}

main();
