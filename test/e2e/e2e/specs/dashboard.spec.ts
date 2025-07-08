import { expect, test } from "@playwright/test";
import path from "path";

import { envRoleUsers } from "@/lib/envRoleUsers";
import { DashboardPage } from "@/pages/dashboard.page";

let dashboardPage;
const ENV = process.env.ENV || "local";
const users = envRoleUsers[ENV];

for (const [role, user] of Object.entries(users)) {
  if (!user.capabilities.includes("dashboard")) continue;

  test.describe("Dashboard page", () => {
    test.use({
      storageState: path.resolve(`.auth/${ENV}/${role}.json`),
    });

    test.describe(`${role} dashboard`, () => {
      test.beforeEach(async ({ page }) => {
        dashboardPage = new DashboardPage(page);
        await page.goto("/dashboard");
      });

      test.describe("UI validations", {}, () => {
        test("navigation banner updates", async () => {
          // here
          await expect(dashboardPage.homeLink).toBeVisible();
          await expect(dashboardPage.homeLink).toHaveText("Home");
          await expect(dashboardPage.homeLink).not.toHaveClass("underline");

          await expect(dashboardPage.dashboardLink).toBeVisible();
          await expect(dashboardPage.dashboardLink).toHaveText("Dashboard");
          await expect(dashboardPage.dashboardLink).toHaveClass(/underline/);

          await expect(dashboardPage.faqLink).toBeVisible();
          await expect(dashboardPage.faqLink).toHaveText("View FAQs");
          await expect(dashboardPage.faqLink).not.toHaveClass("underline");
        });
      });
    });
  });
}
