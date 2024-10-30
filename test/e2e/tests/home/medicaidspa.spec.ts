import { test } from "@playwright/test";

test.describe.skip("Form Submission", async () => {
  // comment this out until we need it
  // test.beforeAll();
  test("Create and submit a Medicaid SPA", () => {
    /* Login */
    // Navigate to the OneMAC Home Page using the home.page.ts file. 
    // Login to MAKO as a State User, using the loginPage.ts script to navigate to the Login prompt. 
    // Refer to the users.ts file to view the available users for MAKO.

    /* Dashboard */
    // Select New Submission on the Dashboard page. 
    // Select State Plan Amendment (SPA) on the Submission Type page. 
    // Select Medicaid SPA on the SPA Type page. 
    // Select All Other Medicaid SPA Submissions for Medicaid SPA Type. 
    // This should take the user to the Medicaid SPA Details page. 

    /* Medicaid SPA Details */
  });
});
