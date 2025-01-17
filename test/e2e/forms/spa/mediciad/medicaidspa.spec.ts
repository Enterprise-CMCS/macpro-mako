import { test } from "@playwright/test";

test.describe("Medicaid SPA Details page", {tag: ["@SPA", "@FCexample"]}, () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/dashboard");
    // await page.goto("/new-submission/spa/medicaid/create?origin=spas");
    await page.getByTestId("new-sub-button").click();
    await page.getByTestId('card-inner-wrapper').first().click();
    await page.getByTestId('card-inner-wrapper').first().click();
    await page.getByTestId('card-inner-wrapper').last().click();
  });

  test("file choose sample", async ({page}) => {
    await expect(page.getByTestId("detail-section-title")).toBeVisible();

    // const fileChooserPromise = page.waitForEvent('filechooser');
    // const attachmentSection = await page.getByTestId("attachment-section");
    // await attachmentSection.locator("div:nth-child(1)").click();
    // const fileChooser = await fileChooserPromise;
    // await fileChooser.setFiles('../../../../fixtures/upload-sample.png');

    // await attachmentSection.locator("div:nth-child(2)").click();
    // // const fileChooser = await fileChooserPromise;
    // await fileChooser.setFiles('../../../../fixtures/upload-sample.png');

    await expect(page.getByTestId("submit-action-form")).toBeEnabled();
  });
});