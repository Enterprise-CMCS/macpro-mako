import { test, expect } from "@playwright/test";
import { HomePage } from "../pages/home.page";

let homePage: HomePage;

test.describe("home page", { tag: ["@home", "@e2e", "@sample"] }, () => {
  test.beforeEach(async ({ page }) => {
    homePage = new HomePage(page);

    await page.goto("/");
  });

  test("has title", async ({ page }) => {
    await expect(page).toHaveTitle("OneMAC");
  });

  test("should not display a menu", async () => {
    await expect(homePage.desktop.signInBtn).not.toBeVisible();
  });

  test("see freqiently asked questions header when in FAQ page", async ({ page }) => {
    const popup = page.waitForEvent("popup");
    await homePage.desktop.faqLink.click();
    const foundFaqHeading = await popup;

    await expect(
      foundFaqHeading.getByRole("heading", { name: "Frequently Asked Questions" }),
    ).toBeVisible();
  });

  test("see dashboard link when logged in", async ({ page }) => {
    await expect(page.getByTestId("Dashboard-d")).toBeVisible();
    await expect(homePage.desktop.homeLink).toBeVisible();
  });
});
