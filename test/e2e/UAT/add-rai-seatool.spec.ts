import { test, expect } from "@playwright/test";

const spaIDs = [
  "SC-25-8072",
  "SC-25-8073",
  "SC-25-8074",
  "SC-25-8075",
  "SC-25-8076",
  "SC-25-8078",
];

test.describe("", { tag: ["@SEAADDRAI"] }, () => {
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

      // await page.locator("#addRAI").click();
      await page.waitForTimeout(250);
      // await page.locator("#RAIs_0__RAI_Requested_Date").clear();
      // await page.locator("#RAIs_0__RAI_Requested_Date").click();
      // await page.waitForTimeout(500);
      // await page.locator("#RAIs_0__RAI_Requested_Date").fill("03/24/2025");
      await page.locator("#RAIs_0__RAI_Received_Date").fill("03/25/2025");
      await page.locator("#RAIs_0__RAI_Withdrawn_Date").click();

      // await page.keyboard.press("Enter");
      await page.waitForTimeout(250);
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
