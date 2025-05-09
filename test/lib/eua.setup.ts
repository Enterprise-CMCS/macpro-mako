import { test as setup } from "@playwright/test";

import playwrightConfig from "@/playwright.config";

// import { getDeploymentConfig, getSecret } from "./auth.secrets";
import { generateAuthFile } from "./auth.setup";

const { baseURL } = playwrightConfig.projects[6].use;
const stage = process.env.STAGE_NAME || "main";
const project = process.env.PROJECT;

const euaAuthFile = "./playwright/.auth/eua-user.json";
const EUAID = process.env.EUAID;
const EUAPASSWORD = process.env.EUAPASSWORD;

console.log(`[Setup] Stage: ${stage} | Project: ${project} | Base URL: ${baseURL}`);

setup("mfa auth", async () => {
  if (!EUAID || !EUAPASSWORD) {
    console.error("no EUA ID or password provided.");
  } else {
    await generateAuthFile({
      baseURL,
      user: EUAID,
      password: EUAPASSWORD,
      storagePath: euaAuthFile,
      mfa: false,
      eua: true,
    });
  }
});
