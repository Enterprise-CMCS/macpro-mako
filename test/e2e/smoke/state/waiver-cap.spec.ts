import { expect, test } from "@playwright/test";

const fileName = "upload-sample.png";
const filePath = `../test/fixtures/${fileName}`;

const SS = "ZZ";
const NNNN = 5005;

const WAIVERID = `${SS}-${NNNN}.R00.00`;

test.describe("1915 B cap", {}, () => {
  test.use({ storageState: "./playwright/.auth/zzState-user.json" });

  test.beforeEach(async ({ page }) => {
    await page.goto("/dashboard");
  });

  test("create package", async ({ page }) => {
    await page.getByTestId("new-sub-button").click();
    await page.getByTestId("card-inner-wrapper").last().click();
    await page.waitForTimeout(500);
    await page.getByTestId("card-inner-wrapper").nth(1).click(); //1915 b
    await page.waitForTimeout(500);
    await page.getByTestId("card-inner-wrapper").last().click(); // cap
    await page.waitForTimeout(500);
    await page.getByTestId("card-inner-wrapper").first().click(); // new
    await page.waitForTimeout(500);

    await expect(page.getByTestId("attachment-section")).toBeVisible();

    await page.locator("#id").fill(WAIVERID);
    await page.getByTestId("proposedEffectiveDate-datepicker").click();
    await page.keyboard.press("Enter");

    await page.getByTestId("bCapWaiverApplication-upload").setInputFiles(filePath);
    await page.waitForTimeout(500);

    await page.getByTestId("bCapCostSpreadsheets-upload").setInputFiles(filePath);
    await page.waitForTimeout(500);

    await expect(page.getByTestId("submit-action-form")).toBeEnabled();
    await page.waitForTimeout(500);

    await page.getByTestId("submit-action-form").click();
    await page.waitForURL(/dashboard/);

    await expect(page.getByRole("alert")).toBeVisible();
    await expect(page.getByRole("alert")).toHaveCSS("background-color", "rgb(231, 244, 228)");

    await expect(page.getByTestId("banner-header")).toBeVisible();
    await expect(page.getByTestId("banner-header")).toHaveText("Package submitted");

    await expect(page.getByTestId("banner-body")).toBeVisible();
    await expect(page.getByTestId("banner-body")).toHaveText("Your submission has been received.");

    await expect(page.getByTestId("banner-close")).toBeVisible();
  });

  test("new package appears in dashboard", async ({ page }) => {
    const row = page.locator("tbody tr").nth(0);
    const cells = row.locator("td");

    await page.getByRole("tab", { name: "Waivers" }).click();

    await expect(cells.nth(1)).toBeVisible();
    await expect(cells.nth(1)).toHaveText(WAIVERID);

    await expect(cells.nth(3)).toBeVisible();
    await expect(cells.nth(3)).toHaveText("1915(b)");

    await expect(cells.nth(5)).toBeVisible();
    await expect(cells.nth(5)).toHaveText("Submitted");
  });
});

test.describe("CMS Dashboard Validation", () => {
  test.use({ storageState: "./playwright/.auth/eua-user.json" });

  test.beforeEach(async ({ page }) => {
    await page.waitForTimeout(2000);
    await page.goto("/dashboard");

    await page.getByRole("tab", { name: "Waivers" }).click();
    await expect(page.getByRole("tab", { name: "Waivers" })).toHaveAttribute(
      "data-state",
      "active",
    );
    await page.locator("#searchInput").fill(WAIVERID);
    await page.waitForTimeout(1000);
  });

  test("new package appears in dashboard", async ({ page }) => {
    const row = page.locator("tbody tr").nth(0);
    const cells = row.locator("td");

    await expect(cells.nth(1)).toBeVisible();
    await expect(cells.nth(1)).toHaveText(WAIVERID);

    await expect(cells.nth(3)).toBeVisible();
    await expect(cells.nth(3)).toHaveText("1915(b)");

    await expect(cells.nth(5)).toBeVisible();
    await expect(cells.nth(5)).toHaveText("Submitted - Intake Needed");
  });
});
