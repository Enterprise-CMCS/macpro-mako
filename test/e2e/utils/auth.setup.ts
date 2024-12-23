import { test as setup } from "@playwright/test";
import { testUsers } from "./users";
import { LoginPage } from "../pages";

const reviewerAuthFile = ".auth/reviewer-user.json";
const stateSubmitterAuthFile = ".auth/state-user.json";

/**
 * Rewrite without using a test. This throws off the report count
 */
setup("authenticate state submitter", async ({ page, context }) => {
  const loginPage = new LoginPage(page);
  await loginPage.goto();

  await loginPage.login(testUsers.state, password);
  await context.storageState({ path: stateSubmitterAuthFile });
});

/**
 * Rewrite without using a test. This throws off the report count
 */
setup("authenticate cms reviewer", async ({ page, context }) => {
  const loginPage = new LoginPage(page);
  await loginPage.goto();

  await loginPage.login(testUsers.reviewer, password);
  await context.storageState({ path: reviewerAuthFile });
});
