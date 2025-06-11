import { test as setup } from "@playwright/test";

import { checkAuthPath, generateAuthFile } from "./auth.setup";
import { baseURL } from "./baseURLs";

const stage = process.env.STAGE_NAME || "main";
const project = process.env.PROJECT;

const zzStateAuthFile = "./playwright/.auth/zzState-user.json";
const ZZSTATEID = process.env.ZZSTATEID;
const ZZSTATEPASSWORD = process.env.ZZSTATEPASSWORD;

console.log(`[Setup] Stage: ${stage} | Project: ${project} | Base URL: ${baseURL}`);

setup("mfa auth", async () => {
  if (!ZZSTATEID || !ZZSTATEPASSWORD) {
    console.error("no ZZ State ID or password provided.");
  } else {
    await checkAuthPath(zzStateAuthFile);

    await generateAuthFile({
      baseURL: baseURL.prod,
      user: ZZSTATEID,
      password: ZZSTATEPASSWORD,
      storagePath: zzStateAuthFile,
      mfa: true,
    });
  }
});
