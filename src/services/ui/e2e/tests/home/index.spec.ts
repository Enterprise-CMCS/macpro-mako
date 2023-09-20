import * as Libs from "../../../../../libs/secrets-manager-lib";
import { test, expect } from "@playwright/test";
import { testUsers } from "e2e/utils/users";
const stage =
  process.env.STAGE_NAME === "production" || process.env.STAGE_NAME === "val"
    ? process.env.STAGE_NAME
    : "default";
const secretId = `${process.env.PROJECT}/${stage}/bootstrapUsersPassword`;

const password = (await Libs.getSecretsValue(
  process.env.REGION_A as string,
  secretId
)) as string;

test("has title", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveTitle(/CMS MAKO/);
});

test("see frequently asked questions header when in faq page", async ({
  page,
}) => {
  await page.goto("/");
  await page.getByRole("link", { name: "FAQ" }).first().click();

  const foundFaqHeading = await page
    .getByRole("heading", { name: "Frequently Asked Questions" })
    .isVisible();
  expect(foundFaqHeading).toBeTruthy();
});

test("see dashboard link when log in", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Sign In" }).click();
  await page
    .getByRole("textbox", { name: "name@host.com" })
    .type(testUsers.state);
  await page.getByRole("textbox", { name: "Password" }).type(password);
  await page.getByRole("button", { name: "submit" }).click();
  await page.getByRole("link", { name: "Dashboard" }).click();

  const dashboardLinkVisible = await page
    .getByRole("link", { name: "Dashboard" })
    .isVisible();
  expect(dashboardLinkVisible).toBeTruthy();
});

test("failed incorrect login username", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Sign In" }).click();
  await page.getByRole("textbox", { name: "name@host.com" }).type(".");
  await page.getByRole("textbox", { name: "Password" }).type(password);
  await page.getByRole("button", { name: "submit" }).click();
  await page.locator("#loginErrorMessage").first().isVisible();
});
