import { test, expect } from "@playwright/test";

const numberOfSPAs = 6;
const SS = "CO";
const YY = "25";
let NNNN = 9047;

const fileName = "upload-sample.png";
const filePath = `../fixtures/${fileName}`;

for (let i = 0; i < numberOfSPAs; i++) {
  // test.beforeEach(async ({ page }) => {
    
  // });

  test.describe(`create chip SPA for ${NNNN}`, { tag: ["@UATCSPA"] }, () => {
    test(`chip ${i}`, async ({ page }) => {
      await page.goto("/dashboard");
      await page.getByTestId("new-sub-button").click();
      await page.getByTestId("card-inner-wrapper").first().click(); //spa
      await page.waitForTimeout(500);
      await page.getByTestId("card-inner-wrapper").last().click(); //chip
      await page.waitForTimeout(500);
      await page.getByTestId("card-inner-wrapper").last().click();
      await page.waitForTimeout(500);

      NNNN++;

      await expect(page.getByTestId("attachment-section")).toBeVisible();
      await expect(page.getByTestId("currentStatePlan-label")).toBeVisible();
      const SPAID = `${SS}-${YY}-${NNNN}`;
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
      console.log(SPAID);
      await page.getByTestId("submit-action-form").click();
      await page.waitForTimeout(1000);
    });
  });
}

// CO-25-9030
// CO-25-9031
// CO-25-9032
// CO-25-9033
// CO-25-9034
// CO-25-9035
// CO-25-9036
// CO-25-9037
// CO-25-9038
// CO-25-9039
// CO-25-9040
// CO-25-9041