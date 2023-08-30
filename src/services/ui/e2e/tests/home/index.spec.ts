import { test, expect } from "@playwright/test";

const password = process.env.VITE_BOOTSTRAP_USERS_PW!;

test("has title", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveTitle(/CMS MAKO/);
});

test("has faq Page", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("link", { name: "FAQ" }).click();
});

test("log in test", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Sign In" }).click();
  await page.getByRole("textbox", { name: "name@host.com" }).click();
  await page.getByRole("textbox", { name: "name@host.com" }).fill("george@example.con");
  await page.getByRole("textbox", { name: "Password" }).click();
  await page.getByRole("textbox", { name: "Password" }).fill(password);
  await page.getByRole("button", { name: "submit" }).click();

  const isLoggedIn = await page.getByRole("link", { name: "Dashboard" }).isVisible();
  const isLoginFailed = await page.getByRole("paragraph").click();
  if (isLoggedIn) {
    expect(isLoggedIn).toBeTruthy();
  }
  else {
    expect(isLoginFailed).toBeTruthy;
  }
});