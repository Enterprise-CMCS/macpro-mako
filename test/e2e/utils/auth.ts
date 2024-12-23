import { test as setup } from "@playwright/test";
import { LoginPage } from "../pages";
import { SecretsManagerClient, GetSecretValueCommand } from "@aws-sdk/client-secrets-manager";
import { SSMClient, GetParameterCommand } from "@aws-sdk/client-ssm";
import { fromEnv } from "@aws-sdk/credential-providers";

/**
 * Consolidated test user credentials. You may store these emails in env variables if you like:
 */
const testUsers = {
  state: process.env.STATE_USER ?? "george@example.com",
  reviewer: process.env.REVIEWER_USER ?? "reviewer@example.com",
};

/**
 * We'll load the E2E password from an environment variable by default,
 * but if we're running in CI (i.e. process.env.CI === "true"), we'll
 * attempt to fetch it from AWS Secrets Manager using the devPasswordArn
 * property in our deployment config SSM param.
 */
let password = process.env.E2E_PASSWORD || "";

async function fetchPasswordFromAws(): Promise<string> {
  const stage = process.env.STAGE_NAME ?? "dev";
  const project = process.env.PROJECT ?? "myproject";

  // 1) Grab the deployment config JSON from SSM
  const ssmClient = new SSMClient({
    region: "us-east-1",
    credentials: fromEnv(),
  });

  const parameterResponse = await ssmClient.send(
    new GetParameterCommand({
      Name: `/${project}/${stage}/deployment-config`,
    }),
  );

  if (!parameterResponse.Parameter?.Value) {
    throw new Error("Unable to retrieve deployment-config from SSM.");
  }

  const deploymentConfig = JSON.parse(parameterResponse.Parameter.Value) as {
    devPasswordArn: string;
  };

  // 2) Retrieve the password Secret from Secrets Manager
  const smClient = new SecretsManagerClient({ region: "us-east-1" });
  const secretResponse = await smClient.send(
    new GetSecretValueCommand({
      SecretId: deploymentConfig.devPasswordArn,
    }),
  );

  if (!secretResponse.SecretString) {
    throw new Error("Unable to retrieve secret string from Secrets Manager.");
  }

  return secretResponse.SecretString;
}

/**
 * Use an async getter for the password, so it can fetch from Secrets Manager
 * if not already provided. If we don't find it there, we fall back to a local
 * default (which you can override in your environment variables).
 */
async function getPassword(): Promise<string> {
  if (!password) {
    if (process.env.CI === "true") {
      password = await fetchPasswordFromAws();
    } else {
      // Fallback for local usage if no E2E_PASSWORD is set
      password = "LocalFallbackPassword";
    }
  }
  return password;
}

const reviewerAuthFile = ".auth/reviewer-user.json";
const stateSubmitterAuthFile = ".auth/state-user.json";

/**
 * We create two "setup" blocks that Playwright will run at the beginning of
 * the test suite. These store the browser state for the respective user types.
 */

/**
 * "authenticate state submitter"
 * Logs in as the "state" user, storing the session state in `.auth/state-user.json`
 */
setup("authenticate state submitter", async ({ page, context }) => {
  const loginPage = new LoginPage(page);
  await loginPage.goto();

  const pw = await getPassword();
  await loginPage.login(testUsers.state, pw);
  await context.storageState({ path: stateSubmitterAuthFile });
});

/**
 * "authenticate cms reviewer"
 * Logs in as the "reviewer" user, storing the session state in `.auth/reviewer-user.json`
 */
setup("authenticate cms reviewer", async ({ page, context }) => {
  const loginPage = new LoginPage(page);
  await loginPage.goto();

  const pw = await getPassword();
  await loginPage.login(testUsers.reviewer, pw);
  await context.storageState({ path: reviewerAuthFile });
});

/**
 * Usage:
 *  - Locally: Provide E2E_PASSWORD in your .env or shell if you want a custom password
 *    or let it fallback to "LocalFallbackPassword".
 *
 *  - CI: Set process.env.CI="true" and PROJECT, STAGE_NAME, plus valid AWS credentials
 *    so the password can be fetched from Secrets Manager automatically.
 *
 * For the user emails, you can supply environment variables:
 *   STATE_USER="someuser@example.com"
 *   REVIEWER_USER="reviewer@example.com"
 * or just rely on the defaults in `testUsers`.
 */
