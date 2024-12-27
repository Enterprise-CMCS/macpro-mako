import { test } from "@playwright/test";
import { HomePage, LoginPage } from "pages";

test.describe.skip("Form Submission", async () => {
  // comment this out until we need it

  test.beforeAll(async ({ page }) => {
    /* Login */
    // Navigate to the OneMAC Home Page using the home.page.ts file. 
    // Login to MAKO as a State User, using the loginPage.ts script to navigate to the Login prompt. 
    // Refer to the users.ts file to view the available users for MAKO.

  });
  test("Create and submit an Appendix K Amendment Waiver", () => { });
});
