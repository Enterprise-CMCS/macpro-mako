import { test as setup } from "@playwright/test";

import { checkAuthPath, generateAuthFile } from "./auth.setup";
import { baseURL } from "./baseURLs";

const stage = process.env.STAGE_NAME || "main";
const project = process.env.PROJECT;

const euaAuthFile = "./playwright/.auth/eua-user.json";
const EUAID = process.env.EUAID;
const EUAPASSWORD = process.env.EUAPASSWORD;

console.log(`[EUA Setup] Stage: ${stage} | Project: ${project} | Base URL: ${baseURL}`);

setup("eua auth", async () => {
  if (!EUAID || !EUAPASSWORD) {
    console.error("no EUA ID or password provided.");
  } else {
    await checkAuthPath(euaAuthFile);

    await generateAuthFile({
      baseURL: baseURL.prod,
      user: EUAID,
      password: EUAPASSWORD,
      storagePath: euaAuthFile,
      mfa: false,
      eua: true,
    });
  }
});
