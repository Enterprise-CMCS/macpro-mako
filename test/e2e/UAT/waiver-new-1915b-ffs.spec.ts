import { test, expect } from "@playwright/test";

const numberOfWaivers = 12;
const SS = "CO";
let NNNN = 4064;

const fileName = "upload-sample.png";
const filePath = `../fixtures/${fileName}`;

for (let i = 0; i < numberOfWaivers; i++) {
  // test.beforeEach(async ({ page }) => {

  // });

  test.describe(`create 1915b waiver for ${NNNN}`, { tag: ["@UAT1915F"] }, () => {
    test(`new ${i}`, async ({ page }) => {
      await page.goto("/dashboard");
      await page.getByTestId("new-sub-button").click();
      await page.getByTestId("card-inner-wrapper").last().click();
      await page.waitForTimeout(500);
      await page.getByTestId("card-inner-wrapper").nth(1).click(); //1915 b
      await page.waitForTimeout(500);
      await page.getByTestId("card-inner-wrapper").first().click(); // ffs
      await page.waitForTimeout(500);
      await page.getByTestId("card-inner-wrapper").first().click(); // new
      await page.waitForTimeout(500);

      NNNN++;

      await expect(page.getByTestId("attachment-section")).toBeVisible();
      const WAIVERID = `${SS}-${NNNN}.R00.00`;
      await page.locator("#id").fill(WAIVERID);
      await page.getByTestId("proposedEffectiveDate-datepicker").click();
      await page.keyboard.press("Enter");

      await page.getByTestId("b4WaiverApplication-upload").setInputFiles(filePath);
      await page.waitForTimeout(500);

      await expect(page.getByTestId("submit-action-form")).toBeEnabled();
      await page.waitForTimeout(500);
      console.log(WAIVERID);
      await page.getByTestId("submit-action-form").click();
      await page.waitForTimeout(1000);
    });
  });
}


// CO-4065.R00.00
// CO-4066.R00.00
// CO-4067.R00.00
// CO-4068.R00.00
// CO-4069.R00.00
// CO-4070.R00.00
// CO-4071.R00.00
// CO-4072.R00.00
// CO-4073.R00.00
// CO-4074.R00.00
// CO-4075.R00.00
// CO-4076.R00.00


// CO-4077.R00.00
// CO-4078.R00.00
// CO-4079.R00.00
// CO-4080.R00.00
// CO-4081.R00.00
// CO-4082.R00.00
// CO-4083.R00.00
// CO-4084.R00.00
// CO-4085.R00.00
// CO-4086.R00.00
// CO-4087.R00.00
// CO-4088.R00.00