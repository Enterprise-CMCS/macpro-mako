import { test as setup } from "@playwright/test";
import { testUsers } from "./users";
import { LoginPage } from "../pages";
import { GetParameterCommand, SSMClient } from "@aws-sdk/client-ssm";
import { SecretsManagerClient, GetSecretValueCommand } from "@aws-sdk/client-secrets-manager";

const stage = process.env.STAGE_NAME || "main";
const deploymentConfig = JSON.parse(
  (
    await new SSMClient({ region: "us-east-1" }).send(
      new GetParameterCommand({
        Name: `/${process.env.PROJECT}/${stage}/deployment-config`,
      }),
    )
  ).Parameter!.Value!,
);

const password = (
  await new SecretsManagerClient({ region: "us-east-1" }).send(
    new GetSecretValueCommand({ SecretId: deploymentConfig.devPasswordArn }),
  )
).SecretString!;

const stateSubmitterAuthFile = "playwright/.auth/state-user.json";

/**
 * Rewrite without using a test. This throws off the report count
 */
setup("authenticate state submitter", async ({ page, context }) => {
  const loginPage = new LoginPage(page);
  await loginPage.goto();

  await loginPage.login(testUsers.state, password);
  await context.storageState({ path: stateSubmitterAuthFile });
});

const reviewerAuthFile = "playwright/.auth/reviewer-user.json";

/**
 * Rewrite without using a test. This throws off the report count
 */
setup("authenticate cms reviewer", async ({ page, context }) => {
  const loginPage = new LoginPage(page);
  await loginPage.goto();

  await loginPage.login(testUsers.reviewer, password);
  await context.storageState({ path: reviewerAuthFile });
});
