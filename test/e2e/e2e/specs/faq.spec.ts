import { expect, test } from "@playwright/test";
import path from "path";

import { envRoleUsers } from "@/lib/envRoleUsers";
import { FAQPage } from "@/pages";

let faqPage: FAQPage;

const ENV = process.env.PW_ENV || "local";
const users = envRoleUsers[ENV];

for (const [role, user] of Object.entries(users)) {
  if (!user.capabilities.includes("faq")) continue;

  test.describe("FAQ Page", () => {
    test.use({
      storageState: path.resolve(`.auth/${ENV}/${role}.json`),
    });

    test.describe(`${role} faq`, () => {
      test.beforeEach(async ({ page }) => {
        faqPage = new FAQPage(page);
        await page.goto("/faq");
      });

      test.describe("UI validation", { tag: ["@here"] }, () => {
        test.describe("header", () => {
          test("should display header", async () => {
            await expect(faqPage.header).toBeVisible();
            await expect(faqPage.header).toHaveText("Frequently Asked Questions");
          });
        });
      });
    });
  });
}
