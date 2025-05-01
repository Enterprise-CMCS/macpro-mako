import { expect, test } from "@/fixtures/mocked";
import { HomePage } from "@/pages";

let homePage: HomePage;

test.describe("home page - no auth", { tag: ["@home", "@e2e", "@smoke"] }, () => {
  test.use({ storageState: { cookies: [], origins: [] } });

  test.beforeEach(async ({ page }) => {
    homePage = new HomePage(page);
    await page.goto("/");
  });

  test.describe("UI validations", () => {
    test("should have a USA banner", async () => {
      await expect(homePage.desktop.usaBanner).toBeVisible();
      await expect(homePage.desktop.usaBanner).toHaveText(
        "An official website of the United States government",
      );

      await expect(homePage.desktop.usaBannerBtn).toBeVisible();
      await expect(homePage.desktop.usaBannerBtn).toHaveText("Here's how you know");

      await expect(homePage.officialUsage).not.toBeVisible();
      await expect(homePage.secureUsage).not.toBeVisible();
    });

    test("should have a navigation banner", async () => {
      await expect(homePage.desktop.logo).toBeVisible();

      await expect(homePage.desktop.homeLink).toBeVisible();
      await expect(homePage.desktop.homeLink).toHaveText("Home");

      await expect(homePage.desktop.faqLink).toBeVisible();
      await expect(homePage.desktop.faqLink).toHaveText("View FAQs");

      await expect(homePage.desktop.signInBtn).toBeVisible();
      await expect(homePage.desktop.signInBtn).toHaveText("Sign In");

      await expect(homePage.desktop.registerBtn).toBeVisible();
      await expect(homePage.desktop.registerBtn).toHaveText("Register");
    });

    test("header section", async () => {
      await expect(homePage.largeLogo).toBeVisible();

      await expect(homePage.welcomeMessage).toBeVisible();
      await expect(homePage.welcomeMessage).toHaveText(
        "Welcome to the official submission system for paper-based state plan amendments (SPAs) and section 1915 waivers.",
      );
    });

    // TODO
    test.skip("New and Notable section", async () => {});

    test.describe("State Users section", () => {
      test("displays the section header", async () => {
        await expect(homePage.stateUsersSection.header).toBeVisible();
        await expect(homePage.stateUsersSection.header).toHaveText("State Users");
      });

      test("How it works", async () => {
        await expect(homePage.stateUsersSection.howItWorks.header).toBeVisible();
        await expect(homePage.stateUsersSection.howItWorks.header).toHaveText("How it works");

        await expect(homePage.stateUsersSection.howItWorks.loginHeader).toBeVisible();
        await expect(homePage.stateUsersSection.howItWorks.loginHeader).toHaveText(
          "Login with IDM",
        );

        await expect(homePage.stateUsersSection.howItWorks.login).toBeVisible();
        await expect(homePage.stateUsersSection.howItWorks.login).toHaveText(
          "Login with your IDM username and password to access your SPA and Waiver dashboard.",
        );

        await expect(homePage.stateUsersSection.howItWorks.attachHeader).toBeVisible();
        await expect(homePage.stateUsersSection.howItWorks.attachHeader).toHaveText(
          "Attach your documents",
        );

        await expect(homePage.stateUsersSection.howItWorks.attach).toBeVisible();
        await expect(homePage.stateUsersSection.howItWorks.attach).toHaveText(
          "Select a submission type and attach required documents relevant to your SPA and/or Waiver submission.",
        );

        await expect(homePage.stateUsersSection.howItWorks.emailHeader).toBeVisible();
        await expect(homePage.stateUsersSection.howItWorks.emailHeader).toHaveText(
          "Receive an email confirmation",
        );

        await expect(homePage.stateUsersSection.howItWorks.email).toBeVisible();
        await expect(homePage.stateUsersSection.howItWorks.email).toHaveText(
          "After you submit, you will receive an email confirmation that your submission was successful, marking the start of the 90-day review process.",
        );
      });

      test("Submission Types", async () => {
        await expect(homePage.stateUsersSection.submissionTypes.header).toBeVisible();
        await expect(homePage.stateUsersSection.submissionTypes.header).toHaveText(
          "Submission Types include:",
        );

        await expect(homePage.stateUsersSection.submissionTypes.amendment).toBeVisible();
        await expect(homePage.stateUsersSection.submissionTypes.amendment).toHaveText(
          "Amendments to your Medicaid and CHIP State Plans (not submitted through MACPro, MMDL or WMS).",
        );

        await expect(homePage.stateUsersSection.submissionTypes.responses).toBeVisible();
        await expect(homePage.stateUsersSection.submissionTypes.responses).toHaveText(
          "Official state responses to formal requests for additional information (RAIs) for SPAs (not submitted through MACPro).",
        );

        await expect(homePage.stateUsersSection.submissionTypes.waiver).toBeVisible();
        await expect(homePage.stateUsersSection.submissionTypes.waiver).toHaveText(
          "Section 1915(b) waiver submissions (those not submitted through WMS).",
        );

        await expect(homePage.stateUsersSection.submissionTypes.appK).toBeVisible();
        await expect(homePage.stateUsersSection.submissionTypes.appK).toHaveText(
          "Section 1915(c) Appendix K amendments (which cannot be submitted through WMS).",
        );

        await expect(homePage.stateUsersSection.submissionTypes.responses2).toBeVisible();
        await expect(homePage.stateUsersSection.submissionTypes.responses2).toHaveText(
          "Official state responses to formal requests for additional information (RAIs) for Section 1915(b) waiver actions (in addition to submitting waiver changes in WMS, if applicable).",
        );

        await expect(homePage.stateUsersSection.submissionTypes.te).toBeVisible();
        await expect(homePage.stateUsersSection.submissionTypes.te).toHaveText(
          "State requests for Temporary Extensions for section 1915(b) and 1915(c) waivers.",
        );
      });
    });

    test.describe("CMS Users section", () => {
      test("displays the section header", async () => {
        await expect(homePage.cmsUsersSection.header).toBeVisible();
        await expect(homePage.cmsUsersSection.header).toHaveText("CMS Users");
      });

      test("How it works", async () => {
        await expect(homePage.cmsUsersSection.howItWorks.header).toBeVisible();
        await expect(homePage.cmsUsersSection.howItWorks.header).toHaveText("How it works");
        await expect(homePage.cmsUsersSection.howItWorks.emailHeader).toBeVisible();
        await expect(homePage.cmsUsersSection.howItWorks.emailHeader).toHaveText(
          "Receive an email for submission notification",
        );
        await expect(homePage.cmsUsersSection.howItWorks.email).toBeVisible();
        await expect(homePage.cmsUsersSection.howItWorks.email).toHaveText(
          "After a state adds a submission to OneMAC, you will receive an email notification that a submission was made requiring your review and the submission is on the clock.",
        );
        await expect(homePage.cmsUsersSection.howItWorks.euaHeader).toBeVisible();
        await expect(homePage.cmsUsersSection.howItWorks.euaHeader).toHaveText("Login with EUA");
        await expect(homePage.cmsUsersSection.howItWorks.eua).toBeVisible();
        await expect(homePage.cmsUsersSection.howItWorks.eua).toHaveText(
          "Login with your EUA username and password to access the SPA and Waiver dashboard.",
        );
        await expect(homePage.cmsUsersSection.howItWorks.assignedHeader).toBeVisible();
        await expect(homePage.cmsUsersSection.howItWorks.assignedHeader).toHaveText(
          "Review your assigned submission",
        );
        await expect(homePage.cmsUsersSection.howItWorks.assigned).toBeVisible();
        await expect(homePage.cmsUsersSection.howItWorks.assigned).toHaveText(
          "Search the submission ID from the email and click on the submission to view and review details and attachments.",
        );
      });

      test("Submission types", async () => {
        await expect(homePage.cmsUsersSection.submissionTypes.header).toBeVisible();
        await expect(homePage.cmsUsersSection.submissionTypes.header).toHaveText(
          "Submission Types include:",
        );
        await expect(homePage.cmsUsersSection.submissionTypes.amendments).toBeVisible();
        await expect(homePage.cmsUsersSection.submissionTypes.amendments).toHaveText(
          "Amendments to your Medicaid and CHIP State Plans.",
        );
        await expect(homePage.cmsUsersSection.submissionTypes.responses).toBeVisible();
        await expect(homePage.cmsUsersSection.submissionTypes.responses).toHaveText(
          "Official state responses to formal requests for additional information (RAIs) for SPAs.",
        );
        await expect(homePage.cmsUsersSection.submissionTypes.waiver).toBeVisible();
        await expect(homePage.cmsUsersSection.submissionTypes.waiver).toHaveText(
          "Section 1915(b) waiver submissions.",
        );
        await expect(homePage.cmsUsersSection.submissionTypes.appK).toBeVisible();
        await expect(homePage.cmsUsersSection.submissionTypes.appK).toHaveText(
          "Section 1915(c) Appendix K amendments.",
        );
        await expect(homePage.cmsUsersSection.submissionTypes.responses2).toBeVisible();
        await expect(homePage.cmsUsersSection.submissionTypes.responses2).toHaveText(
          "Official state responses to formal requests for additional information (RAIs) for Section 1915(b) waiver actions.",
        );
        await expect(homePage.cmsUsersSection.submissionTypes.te).toBeVisible();
        await expect(homePage.cmsUsersSection.submissionTypes.te).toHaveText(
          "State requests for Temporary Extensions for section 1915(b) and 1915(c) waivers.",
        );
      });
    });

    test("do you need support", async ({ page }) => {
      await expect(page.locator("h4")).toBeVisible();
      await expect(page.locator("h4")).toHaveText("Do you have questions or need support?");

      await expect(page.getByRole("button", { name: "View FAQs" })).toBeVisible();
      await expect(page.getByRole("button", { name: "View FAQs" })).toHaveText("View FAQs");
    });

    test("footer", async ({ page }) => {
      await expect(page.locator("footer")).toBeVisible();

      await expect(homePage.footer.medicaidLogo).toBeVisible();

      await expect(homePage.footer.dohLogo).toBeVisible();

      await expect(homePage.footer.fedDisclaimer).toBeVisible();
      await expect(homePage.footer.fedDisclaimer).toHaveText(
        "A federal government website managed and paid for by the U.S. Centers for Medicare and Medicaid Services and part of the MACPro suite.",
      );

      const child = await homePage.footer.confirmEmail;

      await expect(page.locator("footer > div > div").filter({ has: child })).toBeVisible();
      // await expect(page.locator("footer > div > div").filter({ has: child })).toHaveText("dasjkldjaslkdjaskl");
      await expect(page.locator("footer > div > div").filter({ has: child })).toHaveText(
        "Email OneMAC_Helpdesk@cms.hhs.gov for help or feedback7500 Security Boulevard Baltimore, MD 21244",
      );
    });
  });

  test.describe("Workflow validations", () => {
    test.describe("USA Banner Interactions", () => {
      test.beforeEach(async () => {
        await homePage.desktop.usaBannerBtn.click();
      });

      test("should display USA statement", async () => {
        await expect(homePage.officialUsage).toBeVisible();
        await expect(homePage.officialUsage).toHaveText(
          "Official websites use .govA.gov website belongs to an official government organization in the United States.",
        );

        await expect(homePage.secureUsage).toBeVisible();
        await expect(homePage.secureUsage).toHaveText(
          "Secure .gov websites use HTTPSA lock (LockA locked padlock) or https:// means you've safely connected to the .gov website. Share sensitive information only on official, secure websites.",
        );
      });

      test("should collapse the USA statement", async () => {
        await homePage.desktop.usaBannerBtn.click();

        await expect(homePage.officialUsage).not.toBeVisible();
        await expect(homePage.secureUsage).not.toBeVisible();
      });
    });

    test.describe("FAQs", () => {
      test("navigates to the FAQ page", async ({ page }) => {
        await homePage.desktop.faqLink.click();

        const pagePromise = page.waitForEvent("popup");
        const newTab = await pagePromise;
        await newTab.waitForLoadState();

        await expect(newTab.locator("#crosswalk-system")).toBeVisible();
      });
    });

    // TODO
    test.describe.skip("login", () => {
      test.skip("valid login", async () => {});

      test.skip("valid sign out", async () => {});
    });
  });
});
