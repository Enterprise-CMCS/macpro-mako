import { test as setup, expect } from "@playwright/test";

import { LoginPage } from "../pages";
const authUserFile = "./playwright/.auth/user.json";
const authCMSFile = "./playwright/.auth/cms.json";

/**
 * Consolidated test user credentials.
 */
const testUsers = {
  state: process.env.STATE_USER ?? "george@example.com",
  reviewer: process.env.REVIEWER_USER ?? "reviewer@example.com",
};

/**
 * We'll load the E2E password from environment variables or .env.
 */
const password = process.env.E2E_PASSWORD || process.env.VITE_E2E_PW;

/*
 * "authenticate state submitter"
 */
setup("authenticate state submitter", async ({ page }) => {
  const loginPage = new LoginPage(page);
  await loginPage.goto();
  await loginPage.login(testUsers.state, password);
  await expect(page.locator('button:has-text("My Account")')).toBeVisible();
  await page.context().storageState({ path: authUserFile });
});

/**
 * "authenticate cms reviewer"
 */
setup("authenticate cms reviewer", async ({ page }) => {
  const loginPage = new LoginPage(page);
  await loginPage.goto();
  await loginPage.login(testUsers.reviewer, password);
  await expect(page.locator('button:has-text("My Account")')).toBeVisible();
  await page.context().storageState({ path: authCMSFile });
});
