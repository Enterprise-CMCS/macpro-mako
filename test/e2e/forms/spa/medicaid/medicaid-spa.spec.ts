import { test, expect } from "@playwright/test";

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

  test("draft functionality", async ({ page }) => {
    // Fill in SPA ID
    await page.getByLabelText(/SPA ID/).fill("MD-00-0001");

    // Upload a file
    const fileName = "upload-sample.png";
    const filePath = `../fixtures/${fileName}`;
    await page.getByTestId("cmsForm179-upload").setInputFiles(filePath);

    // Save as draft
    await page.getByTestId("save-as-draft-button").click();

    // Verify success message
    await expect(page.getByText(/Draft saved successfully/)).toBeVisible();

    // Verify draft status in listing
    await page.goto("/dashboard");
    await expect(page.getByText("Draft")).toBeVisible();
  });
});
