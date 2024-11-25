import { test } from "@playwright/test";
import { HomePage, LoginPage } from "pages";
import { testUsers } from "utils/users";

test.describe.skip("Form Submission", async () => {
  // comment this out until we need it
  test.beforeAll(async ({ page }) => {
    /* Login */
    // Navigate to the OneMAC Home Page using the home.page.ts file. 
    // Login to MAKO as a State User, using the loginPage.ts script to navigate to the Login prompt. 
    // Refer to the users.ts file to view the available users for MAKO.

    // Creation of Home and Login Pages
    const homePage = new HomePage(page);
    const loginPage = new LoginPage(page);

    await homePage;
    await loginPage.login("", "");

    // Navigate to the Dashboard and click on "New Submission" Button. Convert to Page object in the future. 
    await page.goto("https://mako-val.cms.gov/dashboard");
    await page.getByRole("button", { name: "New Submission+" }).click();


  });
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
    await page.getByRole("textbox", { name: "SPA ID" }).type("SS-YY-NNNN");
    await page.getByRole("button", { name: "Proposed Effective Date of CHIP SPA" })

    /* Attachments */
    // Generate a sample CMS Form 179 file and attach it to the CMS Form 179 field. 
    // Generate a sample SPA Pages file and attach it to the SPA Pages field.
    // Generate a sample Cover Letter file and attach it to the Cover Letter field.

    /* Submission */
    // Click Submit. The user should then be returned to the Dashboard page. 
    // Verify the submission of the SPA by searching for the newly created SPA using the Dashboard. 
    // Confirm that a search of the newly-created SPA opens a Package Details page of the Medicaid SPA. 
  });
});
