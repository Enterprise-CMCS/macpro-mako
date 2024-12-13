import { test, expect } from "@playwright/test";

test.describe("Medicaid SPA - Sub Doc", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await page.getByTestId('Dashboard-d').click();
    await page.locator('a[href*="details/Medicaid%20SPA/CO-22-2020"]').click();
  });

  test.describe("UI - Validation", () => {
    test.describe.skip("Status", () => {
      test("should display Status items", () => {});
    });
    test.describe("form actions", () => {
      test("should display the details page", async ({ page }) => {
        // elements before to be validated
  
        await expect(page.locator('a[href*="upload-subsequent-documents/Medicaid SPA/CO-22-2020?origin=details"]')).toBeVisible();
        await expect(page.locator('a[href*="upload-subsequent-documents/Medicaid SPA/CO-22-2020?origin=details"]')).toContainText('Upload Subsequent Document');
  
        // elements after to be validated
      });
    });
    test.describe.skip("package details", () => {});
    test.describe.skip("package activity", () => {});
  });

  test.describe('Naviation - Validation', () => {
    test('navigate to withdraw package page', () => {
      // see below
    });

    test('navigate to sub doc page', async ({ page }) => {
      await page.locator('a[href*="/actions/upload-subsequent-documents/Medicaid SPA/CO-22-2020?origin=details"]').click();

      await expect(page.getByTestId("detail-section")).toBeVisible();
    });
  });
});