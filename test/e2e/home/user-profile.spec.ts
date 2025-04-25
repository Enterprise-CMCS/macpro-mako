import { expect, test } from "@/fixtures/mocked";

test.describe("User Profile", { tag: ["@profile", "@smoke"] }, () => {
  test.skip("Page header", async () => {});

  test.skip("Goto IDM", async () => {});

  test.describe("My Information", async () => {
    test("state user", async ({ page }) => {
      await page.goto("/profile");

      await expect(page.getByText("State Submitter")).toBeVisible();
      await expect(page.getByText("State Submitter")).toHaveText("State Submitter");
    });

    test("reviewer user", async ({ browser }) => {
      const reviewerContext = await browser.newContext({
        storageState: "playwright/.auth/reviewer-user.json",
      });
      const page = await reviewerContext.newPage();

      await page.goto("/profile");

      await expect(page.getByText("Reviewer", { exact: true })).toBeVisible();
      await expect(page.getByText("Reviewer", { exact: true })).toHaveText("Reviewer");
    });
  });
});
