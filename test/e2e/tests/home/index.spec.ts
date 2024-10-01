import { test, expect } from "@playwright/test";

test.describe("@e2e", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("has title", async ({ page }) => {
    await expect(page).toHaveTitle("OneMAC");
  });

  test("should display a menu", async ({ page }) => {
    await expect(page.getByTestId("sign-in-button-d")).not.toBeVisible();
  });

  test("see frequently asked questions header when in faq page", async ({
    page,
  }) => {
    const popup = page.waitForEvent("popup");
    await page.getByRole("link", { name: "FAQ", exact: true }).click();
    const foundFaqHeading = await popup;
    await foundFaqHeading
      .getByRole("heading", { name: "Frequently Asked Questions" })
      .isVisible();
    expect(foundFaqHeading).toBeTruthy();
  });

  test("see dashboard link when log in", async ({ page }) => {
    await page.getByRole("link", { name: "Dashboard" }).click();

    const dashboardLinkVisible = await page
      .getByRole("link", { name: "Dashboard" })
      .isVisible();
    expect(dashboardLinkVisible).toBeTruthy();
  });
});
