import { test as setup } from "@playwright/test";

import playwrightConfig from "@/playwright.config";

import { getDeploymentConfig, getSecret } from "./auth.secrets";
import { generateAuthFile } from "./auth.setup";

const { baseURL } = playwrightConfig.projects[3].use;
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
