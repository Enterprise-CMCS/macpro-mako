import { test, expect } from "@playwright/test";
import { LoginPage, HomePage } from "pages";
import { testUsers } from "e2e/utils/users";

let homePage;
let loginPage;

// test.use({ storageState: '../../playwright/.auth/state-user.json'})

test.describe('home page', {tag: ['@e2e', "@home"]}, () => {
  test.beforeEach(async ({ page }) => {
    homePage = new HomePage(page);
    loginPage = new LoginPage(page);
    // await page.goto("/");
    await loginPage.goto();
    await loginPage.login(testUsers.state, "" );
  });

  test("has title", async ({ page }) => {    
    await expect(page).toHaveTitle("OneMAC");
  });

  test('should display a menu', async() => {
    await expect(homePage.desktop.signInBtn).not.toBeVisible();
  });
  
  test("see frequently asked questions header when in faq page", async ({ page }) => {
    const popup = page.waitForEvent("popup");
    await homePage.desktop.faqLink.click();
    // await page.getByRole("link", { name: "FAQ", exact: true }).click();
    const foundFaqHeading = await popup;
    await foundFaqHeading
      .getByRole("heading", { name: "Frequently Asked Questions" })
      .isVisible();
    expect(foundFaqHeading).toBeTruthy();
  });
  
  test("see dashboard link when log in", async ({ page }) => {
    // await page.getByRole("link", { name: "Dashboard" }).click();
    // await page.getByTestId("Dashboard-d").click();
  
    // const dashboardLinkVisible = await page
    //   .getByRole("link", { name: "Dashboard" })
    //   .isVisible();
    // expect(dashboardLinkVisible).toBeTruthy();
    await expect(page.getByTestId("Dashboard-d")).toBeVisible();
    await expect(homePage.desktop.homeLink).toBeVisible();
  });  
});

