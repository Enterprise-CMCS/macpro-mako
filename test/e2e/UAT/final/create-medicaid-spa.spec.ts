/**
 * A script to create a SPA from OneMAC through SEA Tool
 */

import { expect, test } from "@playwright/test";

import { Support } from "./libs/support";

let support: Support;

const SS = "SC";
const YY = "25";
const NNNN = 9007; // number is unique and can only be used once
const SPAID = `${SS}-${YY}-${NNNN}-0001`;

const fileName = "upload-sample.png";
const path = `../fixtures/${fileName}`;

test.describe("medicaid SPA", { tag: ["@MED-REGRESSION"] }, () => {
  test.beforeAll(async ({ browser }) => {
    const page = await browser.newPage();
    support = new Support(page);

    await page.goto("/dashboard");
    await page.waitForLoadState();
    /**
     * navigation section to form
     */
    await page.getByTestId("new-sub-button").click();
    await support.navToForm(0);
    await support.navToForm(0);
    await support.navToForm(5);

    await page.locator("#id").fill(SPAID);
    /**
     * the date picker is opened, the enter key is pressed to select
     * today's date. Manually entering a date is not permitted by
     * the applcation
     */
    await page.getByTestId("proposedEffectiveDate-datepicker").click();
    await page.keyboard.press("Enter");

    /**
     * File upload
     */
    await support.fileUpload("cmsForm179-upload", path);
    await support.fileUpload("spaPages-upload", path);

    await expect(page.getByTestId("submit-action-form")).toBeEnabled();
    await page.waitForTimeout(750);
    console.log(SPAID);
    await page.getByTestId("submit-action-form").click();
    await page.getByTestId("banner-header").isVisible();
  });

  test("create: Submitted", async ({ page }) => {
    // validate state submission status
    await page.goto("/dashboard");
    await page.locator("#searchInput").fill(`${SPAID}`);
    await page.waitForTimeout(1250);

    await expect(page.locator("table > tbody > tr > td:nth-child(5)")).toBeVisible();
    await expect(page.locator("table > tbody > tr > td:nth-child(5)")).toHaveText("Submitted");
  });

  test("create: Submitted - Intake Needed", async ({ browser }) => {
    // validate CMS submission status
    const reviewerContext = await browser.newContext({ storageState: "playwright/.auth/reviewer-user.json"});
    const page = await reviewerContext.newPage();

    await page.goto("/dashboard");
    await page.locator("#searchInput").fill(`${SPAID}`);
    await page.waitForTimeout(1250);

    // await expect(page.getByText("Submitted - Intake Needed")).toBeVisible();
    await expect(page.locator("table > tbody > tr > td:nth-child(5)")).toBeVisible();
    await expect(page.locator("table > tbody > tr > td:nth-child(5)")).toHaveText("Submitted - Intake Needed");
  });
});
