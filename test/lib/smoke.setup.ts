import { test as setup } from "@playwright/test";

import { generateAuthFile } from "./auth.setup";
import { baseURL } from "./baseURLs";

const STAGE = process.env.STAGE_NAME || "main";
const PROJECT = process.env.PROJECT;

const euaAuthFile = "./playwright/.auth/eua-user.json";
const zzStateAuthFile = "./playwright/.auth/zzState-user.json";

const EUAID = process.env.EUAID;
const EUAPASSWORD = process.env.EUAPASSWORD;

const ZZSTATEID = process.env.ZZSTATEID;
const ZZSTATEPASSWORD = process.env.ZZSTATEPASSWORD;

console.log(`[Setup] Stage: ${STAGE} | Project: ${PROJECT} | Base URL: ${baseURL.prod}`);

setup("eua auth", async () => {
  if (!EUAID || !EUAPASSWORD) {
    console.error("no EUA ID or password provided.");
  } else {
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

setup("mfa auth", async () => {
  if (!ZZSTATEID || !ZZSTATEPASSWORD) {
    console.error("no ZZ State ID or password provided.");
  } else {
    await generateAuthFile({
      baseURL: baseURL.prod,
      user: ZZSTATEID,
      password: ZZSTATEPASSWORD,
      storagePath: zzStateAuthFile,
      mfa: true,
    });
  }
});
