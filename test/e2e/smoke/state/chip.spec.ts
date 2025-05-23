import { expect, test } from "@playwright/test";

const fileName = "upload-sample.png";
const filePath = `../test/fixtures/${fileName}`;

const SS = "ZZ";
const YY = "25";
const NNNN = 1205;

const SPAID = `${SS}-${YY}-${NNNN}`;

test.describe("CHIP SPA", {}, () => {
  test.use({ storageState: "./playwright/.auth/zzState-user.json" });

  test.beforeEach(async ({ page }) => {
    await page.goto("/dashboard");
  });

  test("create package", async ({ page }) => {
    await page.getByTestId("new-sub-button").click();
    await page.getByTestId("card-inner-wrapper").first().click(); //spa
    await page.waitForTimeout(500);
    await page.getByTestId("card-inner-wrapper").last().click(); //chip
    await page.waitForTimeout(500);
    await page.getByTestId("card-inner-wrapper").last().click();
    await page.waitForTimeout(500);

    await expect(page.getByTestId("attachment-section")).toBeVisible();
    await expect(page.getByTestId("currentStatePlan-label")).toBeVisible();

    await page.locator("#id").fill(SPAID);
    await page.getByTestId("proposedEffectiveDate-datepicker").click();
    await page.keyboard.press("Enter");

    await page.getByTestId("currentStatePlan-upload").setInputFiles(filePath);
    await page.waitForTimeout(500);
    await page.getByTestId("amendedLanguage-upload").setInputFiles(filePath);
    await page.waitForTimeout(500);
    await page.getByTestId("coverLetter-upload").setInputFiles(filePath);
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

    await expect(cells.nth(1)).toBeVisible();
    await expect(cells.nth(1)).toHaveText(SPAID);

    await expect(cells.nth(3)).toBeVisible();
    await expect(cells.nth(3)).toHaveText("CHIP SPA");

    await expect(cells.nth(4)).toBeVisible();
    await expect(cells.nth(4)).toHaveText("Submitted");
  });
});

test.describe("CMS Dashboard Validation", () => {
  test.use({ storageState: "./playwright/.auth/eua-user.json" });

  test.beforeEach(async ({ page }) => {
    await page.goto("/dashboard");

    await page.locator("#searchInput").fill(SPAID);
    await page.waitForTimeout(1000);
  });

  test("new package appears in dashboard", async ({ page }) => {
    const row = page.locator("tbody tr").nth(0);
    const cells = row.locator("td");

    await expect(cells.nth(1)).toBeVisible();
    await expect(cells.nth(1)).toHaveText(SPAID);

    await expect(cells.nth(3)).toBeVisible();
    await expect(cells.nth(3)).toHaveText("CHIP SPA");

    await expect(cells.nth(4)).toBeVisible();
    await expect(cells.nth(4)).toHaveText("Submitted - Intake Needed");
  });
});
