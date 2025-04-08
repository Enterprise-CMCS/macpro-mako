import { test, expect } from "@playwright/test";

const IDS = [
  "CO-25-9003",
  "CO-25-9008",
  "CO-25-9013",
  "CO-25-9018",
  "CO-25-9023",
  "CO-25-9028",
  "CA-25-9003",
  "CA-25-9008",
  "CA-25-9013",
  "CA-25-9018",
  "CA-25-9023",
  "CA-25-9028",
  "SC-25-9003",
  "SC-25-9008",
  "SC-25-9013",
  "SC-25-9018",
  "SC-25-9023",
  "SC-25-9028",
];

test.describe("attach sub doc", { tag: ["@SUBDOCUAT"] }, () => {
  test("add single", async ({ page }) => {
    for (let i = 0; i < IDS.length; i++) {
      // await page.goto(`/actions/upload-subsequent-documents/Medicaid%20SPA/${IDS[i]}?origin=details`);
      await page.goto(`https://mako-val.cms.gov/actions/upload-subsequent-documents/CHIP%20SPA/${IDS[i]}?origin=details`);
      await expect(page.getByTestId("detail-section-child").getByText(`${IDS[i]}`)).toBeVisible();
      // await page.getByTestId("cmsForm179-upload").setInputFiles("../fixtures/Sub-Doc-Attachment v1.docx");
      await page.getByTestId("currentStatePlan-upload").setInputFiles("../fixtures/Sub-Doc-Attachment v1.docx");
      await page.locator("#additional-info").fill("sub doc for OneMAC Upgrade UAT test case");

      await expect(page.getByTestId("submit-action-form")).toBeEnabled();
      // await page.waitForTimeout(2000);
      await page.getByTestId("submit-action-form").click();
      // await page.waitForTimeout(1000);
      await page.getByTestId("dialog-accept").click();
    }
  });

  test("add two", async ({ page }) => {
    for (let i = 0; i < IDS.length; i++) {
      // await page.goto(`/actions/upload-subsequent-documents/Medicaid%20SPA/${IDS[i]}?origin=details`);
      await page.goto(`https://mako-val.cms.gov/actions/upload-subsequent-documents/CHIP%20SPA/${IDS[i]}?origin=details`);

      await expect(page.getByTestId("detail-section-child").getByText(`${IDS[i]}`)).toBeVisible();
      await page.getByTestId("currentStatePlan-upload").setInputFiles("../fixtures/Sub-Doc-Attachment v1.docx");
      await page.getByTestId("currentStatePlan-upload").setInputFiles("../fixtures/Sub-Doc-Attachment v2.docx");
      await page.locator("#additional-info").fill("sub doc for OneMAC Upgrade UAT test case");

      await expect(page.getByTestId("submit-action-form")).toBeEnabled();
      // await page.waitForTimeout(2000);
      await page.getByTestId("submit-action-form").click();
      await page.getByTestId("dialog-accept").click();
    }
  });
});
