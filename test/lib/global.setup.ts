// import { FullConfig } from "@playwright/test";

// import { getDeploymentConfig, getSecret } from "./auth.secrets";
// import { checkAuthPath, generateAuthFile } from "./auth.setup";

// const testUsers = {
//   state: "george@example.com",
//   reviewer: "reviewer@example.com",
// };

// const stateSubmitterAuthFile = "./playwright/.auth/state-user.json";
// const reviewerAuthFile = "./playwright/.auth/reviewer-user.json";
// const euaAuthFile = "./playwright/.auth/eua-user.json";
// const zzStateAuthFile = "./playwright/.auth/zzState-user.json";

// async function globalSetup(config: FullConfig) {
//   // console.log(config.projects[].use.baseURL)
//   // const pwProjectName = process.argv[6]
//   // const pwProject = config.projects.find((project) => project.name === pwProjectName);
//   // console.log(pwProject);
//   // const baseURL = pwProject.use.baseURL || "http://localhost:5000";
//   // const stage = process.env.STAGE_NAME || "main";
//   // const project = process.env.PROJECT;
//   const { baseURL } = config.projects[1].use;
//   const stage = process.env.STAGE_NAME || "main";
//   const project = process.env.PROJECT;

//   const EUAID = process.env.EUAID;
//   const EUAPASSWORD = process.env.EUAPASSWORD;

//   const ZZSTATEID = process.env.ZZSTATEID;
//   const ZZSTATEPASSWORD = process.env.ZZSTATEPASSWORD;

//   console.log(`[Setup] Stage: ${stage} | Project: ${project} | Base URL: ${baseURL}`);

//   const deploymentConfig = await getDeploymentConfig(stage, project);
//   const password = await getSecret(deploymentConfig.devPasswordArn);

//   await checkAuthPath(stateSubmitterAuthFile);

//   await generateAuthFile({
//     baseURL,
//     user: testUsers.state,
//     password,
//     storagePath: stateSubmitterAuthFile,
//   });

//   await generateAuthFile({
//     baseURL,
//     user: testUsers.reviewer,
//     password,
//     storagePath: reviewerAuthFile,
//   });

//   if (!EUAID || !EUAPASSWORD) {
//     console.error("no EUA ID or Password provided.");
//   } else {
//     await generateAuthFile({
//       baseURL,
//       user: EUAID,
//       password: EUAPASSWORD,
//       storagePath: euaAuthFile,
//       eua: true,
//     });
//   }

//   if (!ZZSTATEID || !ZZSTATEPASSWORD) {
//     console.error("no ZZ State ID or password provided.");
//   } else {
//     await generateAuthFile({
//       baseURL,
//       user: ZZSTATEID,
//       password: ZZSTATEPASSWORD,
//       storagePath: zzStateAuthFile,
//       mfa: true,
//     });
//   }
// }

// export default globalSetup;

/**
 * Repurpose section
 */

import { getDeploymentOutput } from "./auth.secrets";
import { baseURL } from "./baseURLs";
import { createStorageState } from "./createStorageState";
import { envRoleUsers } from "./envRoleUsers";

const ENV = process.env.PW_ENV || "local";
const stage = process.env.STAGE_NAME || "main";
const project = process.env.PROJECT;
const deploymentOutput = await getDeploymentOutput(stage, project);

let rootURL;

if (process.env.CI) {
  process.env.PW_ENV = "ci";
  rootURL = deploymentOutput.applicationEndpointUrl;
} else {
  rootURL = baseURL[ENV];
}

export default async function globalSetup() {
  const roles = Object.keys(envRoleUsers[ENV] || {});
  for (const role of roles) {
    await createStorageState(ENV, rootURL, role);
  }
}
