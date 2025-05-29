import { expect, test } from "@playwright/test";

test.describe("User Profile", { tag: ["@smprod"] }, () => {
  test.use({ storageState: "./playwright/.auth/zzState-user.json" });

  test.beforeEach(async ({ page }) => {
    await page.goto("/profile");
  });

  test.describe("UI Validations", () => {
    test("Page header", async ({ page }) => {
      await expect(page.getByRole("heading", { name: "My Profile" })).toBeVisible();
      await expect(page.getByRole("heading", { name: "My Profile" })).toHaveText("My Profile");
    });

    test("Profile Information", async ({ page }) => {
      await expect(page.getByRole("heading", { name: "Profile Information" })).toBeVisible();
      await expect(page.getByRole("heading", { name: "Profile Information" })).toHaveText(
        "Profile Information",
      );

      await expect(page.getByRole("heading", { name: "Full Name" })).toBeVisible();
      await expect(page.getByRole("heading", { name: "Full Name" })).toHaveText("Full Name");

      await expect(page.getByRole("heading", { name: "Role" })).toBeVisible();
      await expect(page.getByRole("heading", { name: "Role" })).toHaveText("Role");

      await expect(page.getByRole("heading", { name: "Email" })).toBeVisible();
      await expect(page.getByRole("heading", { name: "Email" })).toHaveText("Email");
    });

    test("Status", async ({ page }) => {
      await expect(page.getByRole("heading", { name: "State Access Management" })).toBeVisible();
      await expect(page.getByRole("heading", { name: "State Access Management" })).toHaveText(
        "State Access Management",
      );
    });
  });

  test.describe("Interactions", () => {
    test.beforeEach(async ({ page }) => {
      await page.getByRole("button", { name: "My Account" }).click();
    });

    test("displays 'My Account' options", async ({ page }) => {
      await expect(page.getByRole("menuitem", { name: "Manage Profile" })).toBeVisible();
      await expect(page.getByRole("menuitem", { name: "Manage Profile" })).toHaveText(
        "Manage Profile",
      );

      await expect(page.getByRole("menuitem", { name: "Request a Role Change" })).toBeVisible();
      await expect(page.getByRole("menuitem", { name: "Request a Role Change" })).toHaveText(
        "Request a Role Change",
      );

      await expect(page.getByRole("menuitem", { name: "Log Out" })).toBeVisible();
      await expect(page.getByRole("menuitem", { name: "Log Out" })).toHaveText("Log Out");
    });

    test("navigate to Role change page", async ({ page }) => {
      await page.getByRole("menuitem", { name: "Request a Role Change" }).click();

      await expect(page.getByRole("heading", { name: "Registration: User Role" })).toBeVisible();
      await expect(page.getByRole("heading", { name: "Registration: User Role" })).toHaveText(
        "Registration: User Role",
      );

      await expect(page.getByTestId("card-inner-wrapper")).toBeVisible();

      await expect(page.getByRole("heading", { name: "State System Administrator" })).toBeVisible();
      await expect(page.getByRole("heading", { name: "State System Administrator" })).toHaveText(
        "State System Administrator",
      );
    });
  });
});
