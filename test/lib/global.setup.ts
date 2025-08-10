/**
 * A global setup to create the user profiles based on the ENV.
 * The default ENV should be "local"
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
