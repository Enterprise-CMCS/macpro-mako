import { test, expect } from "@playwright/test";

const spaIDs = [
  "SC-25-8072",
  "SC-25-8073",
  "SC-25-8074",
  "SC-25-8075",
  "SC-25-8076",
  "SC-25-8078",
  ];

test.describe("respond to RAI", { tag: ["@RESPONDRAI"] }, () => {
  test("add RAI response", async ({ page }) => {
    for (let i = 0; i < spaIDs.length; i++) {
      await page.goto(`/actions/respond-to-rai/Medicaid%20SPA/${spaIDs[i]}?origin=details`);

      await expect(page.getByTestId("detail-section-child").getByText(`${spaIDs[i]}`)).toBeVisible();
      // await page.getByTestId("revisedAmendedStatePlanLanguage-upload").setInputFiles("../fixtures/Revised-Amended-Language.docx");
      await page.getByTestId("raiResponseLetter-upload").setInputFiles("../fixtures/RAI-Response-Sample.docx");

      await page.locator("#additional-info").fill("sub doc for OneMAC Upgrade UAT test case");

      await expect(page.getByTestId("submit-action-form")).toBeEnabled();
      // await page.waitForTimeout(2000);
      await page.getByTestId("submit-action-form").click();
      // await page.waitForTimeout(1000);
      await page.getByTestId("dialog-accept").click();
    }
  });
});
