import { test } from "@playwright/test";
import { HomePage, LoginPage } from "pages";

test.describe.skip("Form Submission", async () => {
  test.beforeAll(async ({ page }) => {
    /* Login */
    // Navigate to the OneMAC Home Page using the home.page.ts file. 
    // Login to MAKO as a State User, using the loginPage.ts script to navigate to the Login prompt. 
    // Refer to the users.ts file to view the available users for MAKO.

    const homePage = new HomePage(page);
    const loginPage = new LoginPage(page);
    const email = "george@example.com";
    const password = "Testing";

    await homePage;
    await loginPage.login(email, password);

  });
  test("Create and submit a Medicaid SPA", () => {


    /* Dashboard */
    // Select New Submission on the Dashboard page. 
    // Select State Plan Amendment (SPA) on the Submission Type page. 
    // Select Medicaid SPA on the SPA Type page. 
    // Select All Other Medicaid SPA Submissions for Medicaid SPA Type. 
    // This should take the user to the Medicaid SPA Details page. 

    /* Medicaid SPA Details */
    // Enter the SPA ID in the following formats: SS-YY-NNNN, SS-YY-NNNN-XXXX where SS is the state and YY is the current year.
    // Enter the Proposed Effective Date of Medicaid SPA. Default date is the date of SPA creation. 

    /* Attachments */
    // Generate a sample CMS Form 179 file and attach it to the CMS Form 179 field. 
    // Generate a sample SPA Pages file and attach it to the SPA Pages field.

    /* Submission */
    // Click Submit. The user should then be returned to the Dashboard page. 
    // Verify the submission of the SPA by searching for the newly created SPA using the Dashboard.
    // Confirm that a search of the newly-created SPA opens a Package Details page of the Medicaid SPA. 
  });
});
