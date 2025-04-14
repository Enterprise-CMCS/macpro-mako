import { GetSecretValueCommand, SecretsManagerClient } from "@aws-sdk/client-secrets-manager";
import { GetParameterCommand, SSMClient } from "@aws-sdk/client-ssm";
import { chromium, expect, FullConfig } from "@playwright/test";

import { LoginPage } from "@/pages";

const testUsers = {
  state: "george@example.com",
  reviewer: "reviewer@example.com",
};

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

const stateSubmitterAuthFile = "./playwright/.auth/state-user.json";
const reviewerAuthFile = "./playwright/.auth/reviewer-user.json";

async function globalSetup(config: FullConfig) {
  const { baseURL } = config.projects[0].use;
  const browser = await chromium.launch();

  const submitterContext = await browser.newContext({ baseURL });
  const submitterPage = await submitterContext.newPage();
  const submitterLoginPage = new LoginPage(submitterPage);
  await submitterLoginPage.goto();
  await submitterLoginPage.login(testUsers.state, password);

  await expect(submitterPage).toHaveURL("/dashboard");

  await submitterContext.storageState({ path: stateSubmitterAuthFile });

  const reviewerContext = await browser.newContext({ baseURL });
  const reviewerPage = await reviewerContext.newPage();
  const reviewerLoginPage = new LoginPage(reviewerPage);
  await reviewerLoginPage.goto();
  await reviewerLoginPage.login(testUsers.reviewer, password);

  await expect(reviewerPage).toHaveURL(/dashboard/);

  await reviewerContext.storageState({ path: reviewerAuthFile });

  await browser.close();
}

export default globalSetup;
