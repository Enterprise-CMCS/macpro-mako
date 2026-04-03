import { chromium, expect, type Page } from "@playwright/test";
import fs from "fs/promises";
import path from "path";

import { authStrategyMap } from "./authStrategies";
import { envRoleUsers } from "./envRoleUsers";

export async function createStorageState(
  env: string,
  baseURL: string,
  role: string,
): Promise<string> {
  const browser = await chromium.launch();
  const filePath = path.join(".auth", env, `${role}.json`);
  const authDir = path.dirname(filePath);
  const screenshotPath = path.join(authDir, `${role}-auth-setup-failure.png`);
  let page: Page | undefined;

  try {
    const context = await browser.newContext({ baseURL });
    page = await context.newPage();

    const user = envRoleUsers[env]?.[role];
    const loginFn = authStrategyMap[env]?.[role];

    if (!user) throw new Error(`Missing user for ${role} in ${env}`);
    if (!loginFn) throw new Error(`Missing login function for ${role} in ${env}`);

    await loginFn(page, user.username, user.password);
    await page.goto("/dashboard", { waitUntil: "domcontentloaded" });
    await expect(page.getByRole("heading", { name: "Dashboard" })).toBeVisible({ timeout: 10_000 });
    await expect(page.getByRole("tab", { name: "SPAs" })).toBeVisible({ timeout: 10_000 });
    await expect(page.getByTestId("os-table")).toBeVisible({ timeout: 10_000 });

    await fs.mkdir(authDir, { recursive: true });
    await fs.writeFile(filePath, JSON.stringify(await page.context().storageState()));
    return filePath;
  } catch (error) {
    let currentUrl = "unavailable";
    let pageTitle = "unavailable";
    let signInButtonVisible = false;
    let submitButtonVisible = false;
    let dashboardHeadingVisible = false;

    if (page) {
      try {
        await fs.mkdir(authDir, { recursive: true });
        await page.screenshot({ fullPage: true, path: screenshotPath });
      } catch (screenshotError) {
        console.error(
          `[createStorageState] Unable to capture dashboard screenshot for env=${env}, role=${role}`,
          screenshotError,
        );
      }

      [currentUrl, pageTitle, signInButtonVisible, submitButtonVisible, dashboardHeadingVisible] =
        await Promise.all([
          Promise.resolve(page.url()),
          page.title().catch(() => "unavailable"),
          page
            .getByTestId("sign-in-button-d")
            .isVisible()
            .catch(() => false),
          page
            .getByRole("button", { name: "submit" })
            .isVisible()
            .catch(() => false),
          page
            .getByRole("heading", { name: "Dashboard" })
            .isVisible()
            .catch(() => false),
        ]);
    }

    console.error("[createStorageState] Auth state verification failed", {
      env,
      role,
      baseURL,
      currentUrl,
      pageTitle,
      signInButtonVisible,
      submitButtonVisible,
      dashboardHeadingVisible,
      screenshotPath,
    });

    const errorMessage = error instanceof Error ? error.message : String(error);
    throw new Error(
      `Failed to create authenticated storage state for env=${env} role=${role}. ` +
        `Root error: ${errorMessage}. Debug screenshot: ${screenshotPath}`,
    );
  } finally {
    await browser.close();
  }
}
