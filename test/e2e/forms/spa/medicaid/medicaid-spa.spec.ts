import { expect, test } from "@playwright/test";

test.describe("Medicaid SPA Details page", { tag: ["@SPA", "@FCexample"] }, () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/dashboard");
    // await page.goto("/new-submission/spa/medicaid/create?origin=spas");
    await page.getByTestId("new-sub-button").click();
    await page.getByTestId("card-inner-wrapper").first().click();
    await page.waitForTimeout(500);
    await page.getByTestId("card-inner-wrapper").first().click();
    await page.waitForTimeout(500);
    await page.getByTestId("card-inner-wrapper").last().click();
    await page.waitForTimeout(500);
  });

  test("file choose sample", async ({ page }) => {
    const fileName = "upload-sample.png";

    await expect(page.getByTestId("attachment-section")).toBeVisible();
    await expect(page.getByTestId("cmsForm179-click")).toBeVisible();

    const filePath = `../fixtures/${fileName}`;
    await page.getByTestId("cmsForm179-upload").setInputFiles(filePath);
    await expect(page.getByTestId(`${fileName}-chip`)).toBeVisible();
  });
});
