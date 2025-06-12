import { toggleGetLDEvalStreamHandler, toggleGetLDEvalxHandler } from "mocks";

import { expect, test } from "@/fixtures/mocked";
import { HomePage } from "@/pages";

let homePage: HomePage;

test.describe("Down for maintenance", { tag: ["@home", "@CI"] }, () => {
  test.beforeEach(async ({ page, worker }) => {
    worker.use(
      toggleGetLDEvalxHandler({ "site-under-maintenance-banner": "SCHEDULED" }),
      toggleGetLDEvalStreamHandler({ "site-under-maintenance-banner": "SCHEDULED" }),
    );

    homePage = new HomePage(page);

    await page.goto("/");
  });

  test("should display the error message", async ({ page }) => {
    await expect(page).toHaveTitle("");
  });
});
