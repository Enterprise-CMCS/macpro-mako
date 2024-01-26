import { test as setup } from "@playwright/test";
import * as Libs from "../../../../libs/secrets-manager-lib";
import { testUsers } from "./users";
import { LoginPage } from "../pages";

const stage =
  process.env.STAGE_NAME === "production" || process.env.STAGE_NAME === "val"
    ? process.env.STAGE_NAME
    : "default";
const secretId = `${process.env.PROJECT}/${stage}/bootstrapUsersPassword`;

const password = (await Libs.getSecretsValue(
  process.env.REGION_A as string,
  secretId
)) as string;

const stateSubmitterAuthFile = "playwright/.auth/state-user.json";

setup("authenticate state submitter", async ({ page, context }) => {
  const loginPage = new LoginPage(page);
  await loginPage.goto();

  await loginPage.login(testUsers.state, password);
  await context.storageState({ path: stateSubmitterAuthFile });
});

const reviewerAuthFile = "playwright/.auth/reviewer-user.json";

setup("authenticate cms reviewer", async ({ page, context }) => {
  const loginPage = new LoginPage(page);
  await loginPage.goto();

  await loginPage.login(testUsers.reviewer, password);
  await context.storageState({ path: reviewerAuthFile });
});
