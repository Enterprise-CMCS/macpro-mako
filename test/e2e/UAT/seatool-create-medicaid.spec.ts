import { test, expect } from "@playwright/test";

const spaIDs = [
  "4071.R00.00",
  "4072.R00.00",
  "4073.R00.00",
  "4074.R00.00",
  "4075.R00.00",
  "4076.R00.00",
  "4083.R00.00",
  "4084.R00.00",
  "4085.R00.00",
  "4086.R00.00",
  "4087.R00.00",
  "4088.R00.00",
];

test.describe("seatool spa", { tag: ["@SEACREATESPA"] }, () => {
  test("create", async ({ page }) => {
    await page.goto("https://seaval.cms.gov/");
    // await page.waitForTimeout(2000);
    await expect(page.locator("#acceptButton")).toBeVisible();
    await page.locator("#acceptButton").click();
    await expect(page.locator("#UserName")).toBeVisible();
    await expect(page.locator("#Password")).toBeVisible();

    await page.locator("#UserName").fill("cp0c");
    await page.locator("#Password").fill("VKO5@A2V");
    await page.locator("input[type=submit]").click();

    await expect(page.locator("#menu").locator("li").nth(1)).toBeVisible();
    await expect(page.locator("#menu").locator("li").nth(1)).toHaveText("SEA Add/Edit");

    for (let i = 0; i < spaIDs.length; i++) {
      await page.waitForTimeout(1200);
      await page.goto(`https://seaval.cms.gov/StatePlan/Create`);

      await page.locator("#State_Code").selectOption("Colorado");
      await page.waitForTimeout(500);
      await page.locator("#ID_Number").fill(spaIDs[i]);
      await page.waitForTimeout(500);
      await page.locator("#Plan_Type").selectOption("1915(b)");
      await page.waitForTimeout(500);
      await page.locator("#Submission_Date").fill("03/07/2025");
      await page.keyboard.press("Enter");
      await page.waitForTimeout(500);
      await page.locator("#confirm").click();

      await page.waitForTimeout(500);
      // await expect()
      await page.keyboard.press("Enter");
      // await page.locator(".ui-dialog-buttonpane > .ui-button-text").click();
      await page.waitForTimeout(500);
      await expect(page.locator("#ui-id-3")).toBeVisible();
    }
  });
});


// CO-25-9042
// CO-25-9043
// CO-25-9044
// CO-25-9045
// CO-25-9046
// CO-25-9047


// "CO-4071.R00.00",
// "CO-4072.R00.00",
// "CO-4073.R00.00",
// "CO-4074.R00.00",
// "CO-4075.R00.00",
// "CO-4076.R00.00",
// "CO-4083.R00.00",
// "CO-4084.R00.00",
// "CO-4085.R00.00",
// "CO-4086.R00.00",
// "CO-4087.R00.00",
// "CO-4088.R00.00",