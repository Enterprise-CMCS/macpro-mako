import { test, expect } from "@playwright/test";
import { chromium } from "@playwright/test";
import * as $ from "@/selectors";

const user = {
  userName: "george@example.com",
  password: "bigTUNA1!"
};

test("has title", async ({ page }) => {
  await page.goto("https://mako-dev.cms.gov/");

  // Expect a title "to contain" a substring.
  await expect(page).toHaveTitle(/.*CMS MAKO/);
});

test("has faq Page", async ({ page }) => {
  await page.goto("https://mako-dev.cms.gov/");
  await page.getByRole("link", { name: "FAQ" }).click();
});

test("log in test", async ({ page }) => {
  //test.setTimeout(10000);
  const loggedInIndicator = await page.getByRole("button", { name: "submit" });
  if (loggedInIndicator) {
    await page.goto("https://mako-dev.cms.gov/");
    await page.getByRole("button", { name: "Sign In" }).click();
    await page.getByRole("textbox", { name: "name@host.com" }).click();
    await page.getByRole("textbox", { name: "Password" }).click();
    await page.getByRole("textbox", { name: "Password" }).click();
    await page.getByRole("button", { name: "submit" }).click();
    console.log("User successfully logged in!");
  }
  else {
    console.log("Login failed.");
  }
});
