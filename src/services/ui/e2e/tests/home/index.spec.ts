import { test, expect } from "@playwright/test";
import * as dotenv from "dotenv";
import { string } from "zod";

dotenv.config();

const usersname1 = process.env.bootstrapUsersName;
const userspassword2 = process.env.bootstrapUsersPassword;

test("has title", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveTitle(/CMS MAKO/);
});

test("has faq Page", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("link", { name: "FAQ" }).click();
});

test.only("log in test", async ({ page }) => {
  await page.goto("https://mako-dev.cms.gov/");
  await page.getByRole("button", { name: "Sign In" }).click();
  await page.getByRole("textbox", { name: "name@host.com" }).click();
  await page.getByRole("textbox", { name: "name@host.com" }).fill("testun");
  await page.getByRole("textbox", { name: "Password" }).click();
  await page.getByRole("textbox", { name: "Password" }).fill("testpw");
  await page.getByRole("button", { name: "submit" }).click();

  const isLoggedIn = await page.getByRole("link", { name: "Dashboard" }).isVisible();
  const isFailed = await page.getByRole("paragraph").isVisible();

  if (isLoggedIn) {
    expect(isFailed).toBeFalsy();
  }
  else {
    expect(isFailed).toBeTruthy();
  }
});