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
let NNNN = 8059;

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



// CO-25-8060
// CO-25-8061
// CO-25-8062
// CO-25-8063
// CO-25-8064
// CO-25-8065
// CO-25-8066
// CO-25-8067
// CO-25-8068
// CO-25-8069
// CO-25-8070
// CO-25-8071


// CO-25-8072
// CO-25-8073
// CO-25-8074
// CO-25-8075
// CO-25-8076
// CO-25-8077
// CO-25-8078
// CO-25-8079
// CO-25-8080
// CO-25-8081
// CO-25-8082
// CO-25-8083


// MakoIsVeryPrivate1!



// "SC-25-8030",
// "SC-25-8031",
// "SC-25-8032",
// "SC-25-8033",
// "SC-25-8034",
// "SC-25-8035",
// "SC-25-8036",
// "SC-25-8037",
// "SC-25-8038",
// "SC-25-8039",
// "SC-25-8040",
// "SC-25-8041",
// "SC-25-8042",
// "SC-25-8043",
// "SC-25-8044",
// "SC-25-8045",
// "SC-25-8046",
// "SC-25-8047",
// "SC-25-8048",
// "SC-25-8049",
// "SC-25-8050",
// "SC-25-8051",
// "SC-25-8052",
// "SC-25-8053",
// "SC-25-8054",
// "SC-25-8055",
// "SC-25-8056",
// "SC-25-8057",
// "SC-25-8058",
// "SC-25-8059",



