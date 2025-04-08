import { test, expect } from "@playwright/test";

const spaIDs = [
  "CO-4071.R00.00",
"CO-4072.R00.00",
"CO-4073.R00.00",
"CO-4074.R00.00",
"CO-4075.R00.00",
"CO-4076.R00.00",
"CO-4083.R00.00",
"CO-4084.R00.00",
"CO-4085.R00.00",
"CO-4086.R00.00",
"CO-4087.R00.00",
"CO-4088.R00.00",
];

test.describe("", { tag: ["@SEAMEDSPA"] }, () => {
  // test.beforeAll(async ({ page }) => {
  //   await page.goto("https://seaval.cms.gov/");
  //   // await page.waitForTimeout(2000);
  //   await expect(page.locator("#acceptButton")).toBeVisible();
  //   await page.locator("#acceptButton").click();
  //   await expect(page.locator("#UserName")).toBeVisible();
  //   await expect(page.locator("#Password")).toBeVisible();

  //   await page.locator("#UserName").fill("cp0c");
  //   await page.locator("#Password").fill("VKO5@A2V");
  //   await page.locator("input[type=submit]").click();

  //   await expect(page.locator("#menu").locator("li").nth(1)).toBeVisible();
  //   await expect(page.locator("#menu").locator("li").nth(1)).toHaveText("SEA Add/Edit");
  // });

  test("simple", async ({ page }) => {
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
      await page.goto(`https://seaval.cms.gov/StatePlan/Edit/${spaIDs[i]}`);
      await page.locator("#Action_Type").selectOption("New"); // CHIP & 1915b
      // await page.locator("#Priority_Complexity_ID").selectOption("1 - Low Complexity"); //CHIP
      // await page.locator("#Review_Position_ID").selectOption("P1a - Center Director Signs"); //CHIP
      // await page.locator("#Priority_Comments_Memo").fill("test");
      await page.locator("#Service_Type_ID").selectOption("1915 (b) Waiver");
      // await page.locator("#Service_Type_ID").selectOption("Administration");
      await page.locator("#AddServiceType").click();
      await page.waitForTimeout(500);
      await page.locator("#Service_SubType_ID").selectOption("1915 (b) (4)");
      // await page.locator("#Service_SubType_ID").selectOption("Reporting");
      await page.locator("#AddServiceSubType").click();
      await page.waitForTimeout(500);
      await page.locator("#Lead_Analyst_ID").selectOption("Francis, Brian");
      await page.waitForTimeout(500);

      await page.locator("#Title_Name").fill("For OneMAC Upgrade UAT");
      await page.locator("#Summary_Memo").fill("For OneMAC Upgrade UAT");
      // const popupPromise = page.waitForEvent("popup");
      await page.locator("input[type=submit]").click();
      // page.on("dialog", async (dialog) => {
      //   await dialog.accept();
      // });

      // await page.waitForTimeout(10000);
      // const popup = await popupPromise;
      // await page.waitForTimeout(2000);
      // await popup.getByText("OK").click();
      // await page.waitForTimeout(2000);
    }
  });
});


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