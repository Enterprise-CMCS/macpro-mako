import { test, expect } from "@playwright/test";

const numberOfWaivers = 12;
const SS = "CO";
let NNNN = 4076;

const fileName = "upload-sample.png";
const filePath = `../fixtures/${fileName}`;

for (let i = 0; i < numberOfWaivers; i++) {
  // test.beforeEach(async ({ page }) => {
    
  // });

  test.describe(`create 1915b waiver for ${NNNN}`, { tag: ["@UAT1915B"] }, () => {
    test(`new ${i}`, async ({ page }) => {
      await page.goto("/dashboard");
      await page.getByTestId("new-sub-button").click();
      await page.getByTestId("card-inner-wrapper").last().click();
      await page.waitForTimeout(500);
      await page.getByTestId("card-inner-wrapper").nth(1).click(); //1915 b
      await page.waitForTimeout(500);
      await page.getByTestId("card-inner-wrapper").last().click(); // cap
      await page.waitForTimeout(500);
      await page.getByTestId("card-inner-wrapper").first().click(); // new
      await page.waitForTimeout(500);
  
      NNNN++;

      await expect(page.getByTestId("attachment-section")).toBeVisible();
      const WAIVERID = `${SS}-${NNNN}.R00.00`;
      await page.locator("#id").fill(WAIVERID);
      await page.getByTestId("proposedEffectiveDate-datepicker").click();
      await page.keyboard.press("Enter");

      await page.getByTestId("bCapWaiverApplication-upload").setInputFiles(filePath);
      await page.waitForTimeout(500);

      await page.getByTestId("bCapCostSpreadsheets-upload").setInputFiles(filePath);
      await page.waitForTimeout(500);

      await expect(page.getByTestId("submit-action-form")).toBeEnabled();
      await page.waitForTimeout(500);
      console.log(WAIVERID);

      await page.getByTestId("submit-action-form").click();
      await page.waitForTimeout(1000);
      
    });
  });
}


// CO-4030.R00.00
// CO-4031.R00.00
// CO-4032.R00.00
// CO-4033.R00.00
// CO-4034.R00.00
// CO-4035.R00.00
// CO-4036.R00.00
// CO-4037.R00.00
// CO-4038.R00.00
// CO-4039.R00.00
// CO-4040.R00.00
// CO-4041.R00.00


// CO-4042.R00.00
// CO-4043.R00.00
// CO-4044.R00.00
// CO-4045.R00.00
// CO-4046.R00.00
// CO-4047.R00.00
// CO-4048.R00.00
// CO-4049.R00.00
// CO-4050.R00.00
// CO-4051.R00.00
// CO-4052.R00.00
// CO-4053.R00.00