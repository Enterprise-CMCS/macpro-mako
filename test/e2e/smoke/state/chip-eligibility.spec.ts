import { expect, test } from "@/fixtures/mocked";

const fileName = "upload-sample.png";
const filePath = `../test/fixtures/${fileName}`;

const SS = "ZZ";
const YY = "25";
let NNNN = 1300; // increment by 2 after each use.

const WSPAID = `${SS}-${YY}-${NNNN}`;
++NNNN;
const WOSPAID = `${SS}-${YY}-${NNNN}`;

test.describe("CHIP Eligibility SPA", {}, () => {
  test.use({ storageState: "./playwright/.auth/zzState-user.json" });

  test.beforeEach(async ({ page }) => {
    await page.goto("/dashboard");
  });

  test.describe("UI - Validation", () => {
    test("shall have the correct fields", async ({ page }) => {
      await page.getByTestId("new-sub-button").click();
      await page.getByTestId("card-inner-wrapper").first().click(); //spa
      await page.waitForTimeout(500);
      await page.getByTestId("card-inner-wrapper").last().click(); //chip
      await page.waitForTimeout(500);
      await page.getByTestId("card-inner-wrapper").first().click();
      await page.waitForTimeout(500);

      await expect(page.getByTestId("detail-section-title")).toBeVisible();
      await expect(page.getByTestId("detail-section-title")).toHaveText(
        "CHIP Eligibility SPA Details",
      );
    });
  });

  test.describe("Interaction - Validation", () => {});

  test.describe("Workflow - Validation", () => {
    test("create package with eligibility types", async ({ page }) => {
      await page.getByTestId("new-sub-button").click();
      await page.getByTestId("card-inner-wrapper").first().click(); //spa
      await page.waitForTimeout(500);
      await page.getByTestId("card-inner-wrapper").last().click(); //chip
      await page.waitForTimeout(500);
      await page.getByTestId("card-inner-wrapper").first().click();
      await page.waitForTimeout(500);

      await expect(page.getByTestId("attachment-section")).toBeVisible();
      await expect(page.getByTestId("currentStatePlan-label")).toBeVisible();

      await page.locator("#id").fill(WSPAID);

      await page.locator("#chipSubmissionType").click();
      await page.getByTestId("magi-eligibility-and-methods").click();
      await page.getByTestId("non-financial-eligibility").click();
      await page.getByTestId("xxi-medicaid-expansion").click();
      await page.getByTestId("eligibility-process").click();
      await page.waitForTimeout(250);
      await page.locator("#chipSubmissionType").click({ force: true });
      await page.getByTestId("proposedEffectiveDate-datepicker").click();
      await page.keyboard.press("Enter");

      await expect(page.getByTestId("selected-value-chip")).toBeVisible();
      await expect(page.getByTestId("selected-value-chip")).toHaveText(
        "MAGI Eligibility and Methods, Non-Financial Eligibility, XXI Medicaid Expansion, Eligibility Process",
      );

      await page.getByTestId("chipEligibility-upload").setInputFiles(filePath);
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
      await expect(page.getByTestId("banner-body")).toHaveText(
        "Your submission has been received.",
      );

      await expect(page.getByTestId("banner-close")).toBeVisible();
    });

    test("create package without eligibility types", async ({ page }) => {
      await page.getByTestId("new-sub-button").click();
      await page.getByTestId("card-inner-wrapper").first().click(); //spa
      await page.waitForTimeout(500);
      await page.getByTestId("card-inner-wrapper").last().click(); //chip
      await page.waitForTimeout(500);
      await page.getByTestId("card-inner-wrapper").first().click();
      await page.waitForTimeout(500);

      await expect(page.getByTestId("attachment-section")).toBeVisible();
      await expect(page.getByTestId("currentStatePlan-label")).toBeVisible();

      await page.locator("#id").fill(WOSPAID);
      await page.getByTestId("proposedEffectiveDate-datepicker").click();
      await page.keyboard.press("Enter");

      await page.getByTestId("chipEligibility-upload").setInputFiles(filePath);
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
      await expect(page.getByTestId("banner-body")).toHaveText(
        "Your submission has been received.",
      );

      await expect(page.getByTestId("banner-close")).toBeVisible();
    });

    test("new package appears in dashboard with eligibility types", async ({ page }) => {
      await page.goto("/dashboard");

      await page.locator("#searchInput").fill(WSPAID);
      await page.waitForTimeout(1000);

      const row = page.locator("tbody tr").nth(0);
      const cells = row.locator("td");

      await expect(cells.nth(1)).toBeVisible();
      await expect(cells.nth(1)).toHaveText(WSPAID);

      await expect(cells.nth(3)).toBeVisible();
      await expect(cells.nth(3)).toHaveText("CHIP SPA");

      await expect(cells.nth(4)).toBeVisible();
      await expect(cells.nth(4)).toHaveText("Submitted");
    });

    test("new package appears in dashboard without eligibility types", async ({ page }) => {
      await page.goto("/dashboard");

      await page.locator("#searchInput").fill(WOSPAID);
      await page.waitForTimeout(1000);

      const row = page.locator("tbody tr").nth(0);
      const cells = row.locator("td");

      await expect(cells.nth(1)).toBeVisible();
      await expect(cells.nth(1)).toHaveText(WOSPAID);

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

      await page.locator("#searchInput").fill(WSPAID);
      await page.waitForTimeout(1000);
    });

    test("new package appears in dashboard", async ({ page }) => {
      const row = page.locator("tbody tr").nth(0);
      const cells = row.locator("td");

      await expect(cells.nth(1)).toBeVisible();
      await expect(cells.nth(1)).toHaveText(WSPAID);

      await expect(cells.nth(3)).toBeVisible();
      await expect(cells.nth(3)).toHaveText("CHIP SPA");

      await expect(cells.nth(4)).toBeVisible();
      await expect(cells.nth(4)).toHaveText("Submitted - Intake Needed");
    });
  });
});
