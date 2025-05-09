import { test as setup } from "@playwright/test";

import { getDeploymentConfig, getSecret } from "./auth.secrets";
import { generateAuthFile } from "./auth.setup";

const stage = process.env.STAGE_NAME || "main";
const project = process.env.PROJECT;
const deploymentConfig = await getDeploymentConfig(stage, project);
const baseURL = deploymentConfig.applicationEndpointUrl;
const password = await getSecret(deploymentConfig.devPasswordArn);

const stateSubmitterAuthFile = "./playwright/.auth/state-user.json";
const reviewerAuthFile = "./playwright/.auth/reviewer-user.json";

const testUsers = {
  state: "george@example.com",
  reviewer: "reviewer@example.com",
};

console.log("dp config", deploymentConfig);

console.log(`[Setup] Stage: ${stage} | Project: ${project} | Base URL: ${baseURL}`);

setup("auth", async () => {
  await generateAuthFile({
    baseURL,
    user: testUsers.state,
    password,
    storagePath: stateSubmitterAuthFile,
  });

  await generateAuthFile({
    baseURL,
    user: testUsers.reviewer,
    password,
    storagePath: reviewerAuthFile,
  });
});
