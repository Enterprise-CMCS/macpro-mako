import { test } from "@playwright/test";
//import { HomePage, LoginPage } from "pages";

test.describe("Form Submission", async () => {

  test("Create and submit a CHIP SPA", async ({ page }) => {

    /* Dashboard */
    // Select New Submission on the Dashboard page. 
    // Select State Plan Amendment (SPA) on the Submission Type page. 
    // Select CHIP SPA on the SPA Type page. 
    // Select All Other CHIP SPA Submissions for CHIP SPA Type. 
    // This should take the user to the CHIP SPA Details page. 
    await page.goto("https://mako-val.cms.gov/dashboard");
    await page.getByRole("button", { name: "New Submission" }).click();
    await page.getByText("State Plan Amendment (SPA)").click();
    await page.getByText("CHIP SPA").click();
    await page.getByText("All Other CHIP SPA Submissions").click();

    /* CHIP SPA Details */
    // Enter the SPA ID in the following formats: SS-YY-NNNN, SS-YY-NNNN-XXXX where SS is the state and YY is the current year.
    // Enter the Proposed Effective Date of CHIP SPA. Default date is the date of SPA creation. 
    await page.getByRole("textbox", { name: "SPA ID" }).fill("MD-24-NNNN");
    await page.getByRole("button", { name: "Proposed Effective Date of CHIP SPA" }).click();

    /* Attachments */
    // Generate a sample Current State Plan file and attach it to the Current State Plan field. 
    // Generate a sample Amended State Plan file and attach it to the Amended State Plan  field.
    // Generate a sample Cover Letter file and attach it to the Cover Letter field.
    await page.getByText("choose from folder").click();
    await page.getByText("choose from folder").click();
    await page.getByText("choose from folder").click();

    /* Submission */
    // Click Submit. The user should then be returned to the Dashboard page. 
    // Verify the submission of the SPA by searching for the newly created SPA using the Dashboard. 
    // Confirm that a search of the newly-created SPA opens a Package Details page of the CHIP SPA. 
    await page.getByRole("button", { name: "Submit" }).click();
  });
});
