import { FullConfig } from "@playwright/test";

import { getDeploymentConfig, getSecret } from "./auth.secrets";
import { generateAuthFile } from "./auth.setup";

const testUsers = {
  state: "george@example.com",
  reviewer: "reviewer@example.com",
};

const stateSubmitterAuthFile = "./playwright/.auth/state-user.json";
const reviewerAuthFile = "./playwright/.auth/reviewer-user.json";
const euaAuthFile = "./playwright/.auth/eua-user.json";

async function globalSetup(config: FullConfig) {
  const { baseURL } = config.projects[0].use;
  const stage = process.env.STAGE_NAME || "main";
  const project = process.env.PROJECT;

  const EUAID = process.env.EUAID;
  const EUAPASSWORD = process.env.EUAPASSWORD;

  console.log(`[Setup] Stage: ${stage} | Project: ${project} | Base URL: ${baseURL}`);

  const deploymentConfig = await getDeploymentConfig(stage, project);
  const password = await getSecret(deploymentConfig.devPasswordArn);

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

  if (!EUAID || !EUAPASSWORD) {
    console.error("no EUA ID or Password provided.");
  } else {
    await generateAuthFile({
      baseURL,
      user: EUAID,
      password: EUAPASSWORD,
      storagePath: euaAuthFile,
      eua: true,
    });
  }
}

export default globalSetup;
