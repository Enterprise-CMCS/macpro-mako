import { expect, test } from "@/fixtures/mocked";

test.describe("User Profile", { tag: ["@profile", "@smoke"] }, () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/profile");
  });
  test.skip("Page header", async () => {});

  test.skip("Goto IDM", async () => {});

  test.describe("My Information", () => {
    test("profile view", async ({ page }) => {
      await expect(page.getByTestId("user-role")).toBeVisible();
    });
  });
});
