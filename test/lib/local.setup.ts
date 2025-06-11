import { test as setup } from "@playwright/test";

import { getDeploymentConfig, getSecret } from "./auth.secrets";
import { checkAuthPath, generateAuthFile } from "./auth.setup";
import { baseURL } from "./baseURLs";

const stage = process.env.STAGE_NAME || "main";
const project = process.env.PROJECT;

const testUsers = {
  state: "george@example.com",
  reviewer: "reviewer@example.com",
};

const stateSubmitterAuthFile = "./playwright/.auth/state-user.json";
const reviewerAuthFile = "./playwright/.auth/reviewer-user.json";

const deploymentConfig = await getDeploymentConfig(stage, project);
const password = await getSecret(deploymentConfig.devPasswordArn);

console.log(`[Setup] Stage: ${stage} | Project: ${project} | Base URL: ${baseURL}`);

setup("auth", async () => {
  await checkAuthPath(stateSubmitterAuthFile);

  await generateAuthFile({
    baseURL: baseURL.local,
    user: testUsers.state,
    password,
    storagePath: stateSubmitterAuthFile,
  });

  await generateAuthFile({
    baseURL: baseURL.local,
    user: testUsers.reviewer,
    password,
    storagePath: reviewerAuthFile,
  });
});
