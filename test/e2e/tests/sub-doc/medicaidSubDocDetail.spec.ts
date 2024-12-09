import {test, expect} from "@playwright/test";


test.beforeEach(async ({ page }) => {
  await page.goto("/");
  await page.getByTestId("Dashboard-d").click();
  await page.locator('a[href*="details/Medicaid%20SPA/CO-22-2020"]').click();
  await page.locator('a[href*="/actions/upload-subsequent-documents/Medicaid SPA/CO-22-2020?origin=details"]').click();
});

test.describe("UI - Validation", () => {
  test.describe("Breadcrumbs", () => {
    test("should displays breadcrumb elements", async({ page }) => {
      // need a better selector
      await expect(page.locator("#root > div > main > div:nth-child(2) > nav")).toBeVisible();
      await expect(page.locator("#root > div > main > div:nth-child(2) > nav")).toHaveText("DashboardCO-22-2020New Subsequent Documentation");
    });
  });

  test.describe("Form Elements", () => {
    test("Detail Section", async({ page }) => {
      await expect(page.getByTestId("detail-section")).toBeVisible();

      await expect(page.getByTestId("detail-section-title")).toBeVisible();
      await expect(page.getByTestId("detail-section-title")).toHaveText("Medicaid SPA Subsequent Documents Details");

      await expect(page.getByTestId("detail-section-child")).toBeVisible();
      // await expect(page.getByTestId("detail-section-child")).toHaveText(); needs more detailed selectors to validate text
    });

    test("Document Section", async({ page }) => {
      await expect(page.getByTestId("attachment-section")).toBeVisible();

      await expect(page.getByTestId("attachment-section-title")).toBeVisible();
      await expect(page.getByTestId("attachment-section-title")).toHaveText("Subsequent Medicaid SPA Documents *");

      await expect(page.getByTestId("attachment-section-child")).toBeVisible();
      await expect(page.getByTestId("attachments-instructions")).toBeVisible();
      await expect(page.getByTestId("attachments-instructions")).toHaveText("Maximum file size of 80 MB per attachment. You can add multiple files per attachment type. Read the description for each of the attachment types on the FAQ Page.");
      await expect(page.getByTestId("accepted-files")).toBeVisible();
      await expect(page.getByTestId("accepted-files")).toHaveText("We accept the following file formats: .doc, .docx, .pdf, .jpg, .xlsx, and more.  See the full list.");

      await expect(page.getByTestId("cmsForm179-label")).toBeVisible();
      await expect(page.getByTestId("cmsForm179-label")).toHaveText("CMS Form 179");

      // TODO: Extend to all labels
    });

    test("Reason Section", async({ page }) => {
      await expect(page.getByTestId("additional-info")).toBeVisible();

      await expect(page.getByTestId("additional-info-title")).toBeVisible();
      await expect(page.getByTestId("additional-info-title")).toHaveText("Reason for subsequent documents *");

      await expect(page.getByTestId("additional-info-child")).toBeVisible();
    });
  });
});

test.describe.skip("Navigation", () => {});