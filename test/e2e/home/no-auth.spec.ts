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
      // TODO logo assertion

      await expect(homePage.desktop.homeLink).toBeVisible();
      await expect(homePage.desktop.homeLink).toHaveText("Home");

      await expect(homePage.desktop.faqLink).toBeVisible();
      await expect(homePage.desktop.faqLink).toHaveText("FAQ");

      await expect(homePage.desktop.signInBtn).toBeVisible();
      await expect(homePage.desktop.signInBtn).toHaveText("Sign In");

      await expect(homePage.desktop.registerBtn).toBeVisible();
      await expect(homePage.desktop.registerBtn).toHaveText("Register");
    });

    // TODO
    test.skip("header section", async () => {});

    // TODO
    test.skip("New and Notable section", async () => {});

    // TODO
    test.describe.skip("State Users section", () => {
      test.skip("How it works", async () => {});

      test.skip("Submission types", async () => {});
    });

    // TODO
    test.describe.skip("CMS Users section", () => {
      test.skip("How it works", async () => {});

      test.skip("Submission types", async () => {});
    });

    // TODO
    test.skip("do you need support", async () => {});

    // TODO
    test.skip("footer", async () => {});
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
