import { test as setup } from "@playwright/test";

import { getDeploymentConfig, getDeploymentOutput, getSecret } from "./auth.secrets";
import { checkAuthPath, generateAuthFile } from "./auth.setup";

const stage = process.env.STAGE_NAME || "main";
const project = process.env.PROJECT;
const deploymentConfig = await getDeploymentConfig(stage, project);
const deploymentOutput = await getDeploymentOutput(stage, project);
const baseURL = deploymentOutput.applicationEndpointUrl;
const password = await getSecret(deploymentConfig.devPasswordArn);

const stateSubmitterAuthFile = "./playwright/.auth/state-user.json";
const reviewerAuthFile = "./playwright/.auth/reviewer-user.json";

const testUsers = {
  state: "george@example.com",
  reviewer: "reviewer@example.com",
};

console.log(`[Setup] Stage: ${stage} | Project: ${project} | Base URL: ${baseURL}`);

setup("auth", async () => {
  await checkAuthPath(stateSubmitterAuthFile);

  await generateAuthFile({
    baseURL: baseURL,
    user: testUsers.state,
    password,
    storagePath: stateSubmitterAuthFile,
  });

  await generateAuthFile({
    baseURL: baseURL,
    user: testUsers.reviewer,
    password,
    storagePath: reviewerAuthFile,
  });
});
