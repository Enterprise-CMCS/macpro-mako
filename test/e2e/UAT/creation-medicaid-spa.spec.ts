/**
 * This is a script to fabricate data for the purpose of conducting UAT
 */


/**
 * VA, OH, SC, CO, GA, MD
 */



import { test, expect } from "@playwright/test";

const numberOfSPAs = 30;
const SS = "SC";
const YY = "25";
let NNNN = 7999;

const fileName = "upload-sample.png";
const filePath = `../fixtures/${fileName}`;

for (let i = 0; i < numberOfSPAs; i++) {
  // test.beforeEach(async ({ page }) => {
    
  // });

  test.describe(`create medicaid SPA for ${NNNN}`, { tag: ["@UATMSPA"] }, () => {
    test(`medicaid ${i}`, async ({ page }) => {
      // NNNN += 1;

      // console.log(`where am i, ${i}, ${NNNN}`);
      await page.goto("/dashboard");
      await page.getByTestId("new-sub-button").click();
      await page.getByTestId("card-inner-wrapper").first().click();
      await page.waitForTimeout(500);
      await page.getByTestId("card-inner-wrapper").first().click();
      await page.waitForTimeout(500);
      await page.getByTestId("card-inner-wrapper").last().click();
      await page.waitForTimeout(500);

      NNNN++;

      await expect(page.getByTestId("attachment-section")).toBeVisible();
      await expect(page.getByTestId("cmsForm179-click")).toBeVisible();
      const SPAID = `${SS}-${YY}-${NNNN}`;
      await page.locator("#id").fill(SPAID);
      await page.getByTestId("proposedEffectiveDate-datepicker").click();
      await page.keyboard.press("Enter");
      // await expect(page.getByTestId("proposedEffectiveDate-datepicker")).toBeVisible();
      // await page.getByTestId("proposedEffectiveDate-datepicker").fill("02-10-2025");
      await page.getByTestId("cmsForm179-upload").setInputFiles(filePath);
      await page.waitForTimeout(500);
      await page.getByTestId("spaPages-upload").setInputFiles(filePath);
      await page.waitForTimeout(500);
      await expect(page.getByTestId("submit-action-form")).toBeEnabled();
      await page.waitForTimeout(500);
      console.log(SPAID);
      await page.getByTestId("submit-action-form").click();
      await page.waitForTimeout(1000);
    });
  });
}
