import { test, expect } from "@playwright/test";

test.describe("FAQ page", { tag: ["@e2e", "@smoke"] }, () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/faq");
  });

  // this test validates the expansion of a FAQ question, this would be a good case to move to a component test
  test("should display crosswalk system FAQ", async ({ page }) => {
    // this is the css selector for an ID attribute
    await expect(page.locator("#crosswalk-system")).toBeVisible();

    // this is the css selector for a HREF path ending in "state-plan-macpro.pdf"
    await expect(page.locator('a[href*="state-plan-macpro"]')).not.toBeVisible();

    await page.locator("#crosswalk-system").click();
    await expect(page.locator('a[href*="state-plan-macpro"]')).toBeVisible();
  });
});
