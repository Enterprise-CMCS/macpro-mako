import { expect, test } from "@playwright/test";

test.describe("Test group", () => {
  test("seed", async ({ page }) => {
    // Seed for Playwright planner/generator agents. Journeys replace this body.
    await expect(page).toHaveURL(/.*/);
  });
});
