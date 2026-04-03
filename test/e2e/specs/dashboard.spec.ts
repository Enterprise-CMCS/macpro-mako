import { expect, type Page, test, type TestInfo } from "@playwright/test";
import path from "path";

import { envRoleUsers } from "@/lib/envRoleUsers";
import { getMetadataByFile } from "@/lib/metadata.handler";
import { DashboardPage } from "@/pages/dashboard.page";

let dashboardPage: DashboardPage;

const ENV = process.env.PW_ENV || "local";
const users = envRoleUsers[ENV];

async function attachDashboardSetupDiagnostics(page: Page, testInfo: TestInfo, role: string) {
  const [currentUrl, pageTitle, signInButtonVisible, submitButtonVisible, dashboardHeadingVisible] =
    await Promise.all([
      Promise.resolve(page.url()),
      page.title().catch(() => "unavailable"),
      page
        .getByTestId("sign-in-button-d")
        .isVisible()
        .catch(() => false),
      page
        .getByRole("button", { name: "submit" })
        .isVisible()
        .catch(() => false),
      page
        .getByRole("heading", { name: "Dashboard" })
        .isVisible()
        .catch(() => false),
    ]);

  const diagnostics = {
    role,
    env: ENV,
    currentUrl,
    pageTitle,
    signInButtonVisible,
    submitButtonVisible,
    dashboardHeadingVisible,
  };

  await testInfo.attach("dashboard-beforeeach-diagnostics", {
    body: JSON.stringify(diagnostics, null, 2),
    contentType: "application/json",
  });

  try {
    const screenshot = await page.screenshot({ fullPage: true });
    await testInfo.attach("dashboard-beforeeach-screenshot", {
      body: screenshot,
      contentType: "image/png",
    });
  } catch (screenshotError) {
    await testInfo.attach("dashboard-beforeeach-screenshot-error", {
      body: String(screenshotError),
      contentType: "text/plain",
    });
  }

  console.error("[dashboard.beforeEach] Dashboard readiness check failed", diagnostics);
}

for (const [role, user] of Object.entries(users)) {
  if (!user.capabilities.includes("dashboard")) continue;

  test.describe("Dashboard page", { tag: ["@CI"] }, () => {
    test.use({
      storageState: path.resolve(`.auth/${ENV}/${role}.json`),
    });

    test.describe(`${role} dashboard`, () => {
      test.beforeEach(async ({ page }, testInfo) => {
        dashboardPage = new DashboardPage(page);
        await page.goto("/dashboard", { waitUntil: "domcontentloaded" });

        try {
          await expect(page.getByRole("heading", { name: "Dashboard" })).toBeVisible();
          await expect(page.getByRole("tab", { name: "SPAs" })).toBeVisible();
          await expect(page.getByTestId("os-table")).toBeVisible();
        } catch (error) {
          await attachDashboardSetupDiagnostics(page, testInfo, role);
          throw error;
        }
      });

      test.describe("UI validations", {}, () => {
        test("navigation banner updates", async () => {
          await expect(dashboardPage.homeLink).toBeVisible();
          await expect(dashboardPage.homeLink).toHaveText("Home");
          await expect(dashboardPage.homeLink).not.toHaveClass("underline");

          await expect(dashboardPage.dashboardLink).toBeVisible();
          await expect(dashboardPage.dashboardLink).toHaveText("Dashboard");
          await expect(dashboardPage.dashboardLink).toHaveClass(/underline/);

          await expect(dashboardPage.faqLink).toBeVisible();
          await expect(dashboardPage.faqLink).toHaveText("View FAQs");
          await expect(dashboardPage.faqLink).not.toHaveClass("underline");
        });

        test("page header", async ({ page }) => {
          await expect(page.getByRole("heading", { name: "Dashboard" })).toBeVisible();
          await expect(page.getByRole("heading", { name: "Dashboard" })).toHaveText("Dashboard");

          if (role.includes("state")) {
            await expect(page.getByTestId("new-sub-button")).toBeVisible();
            await expect(page.getByTestId("new-sub-button")).toHaveText("New Submission");
          }
        });

        test("SPA and Waiver tabs", async ({ page }) => {
          await expect(page.getByRole("tab", { name: "SPAs" })).toBeVisible();
          await expect(page.getByRole("tab", { name: "SPAs" })).toHaveText("SPAs");

          await expect(page.getByRole("tab", { name: "Waivers" })).toBeVisible();
          await expect(page.getByRole("tab", { name: "Waivers" })).toHaveText("Waivers");
        });

        test("search field", async ({ page }) => {
          await expect(page.getByTestId("filtering").locator("p")).toBeVisible();
          await expect(page.getByTestId("filtering").locator("p")).toHaveText(
            "Search by Package ID, CPOC Name, or Submitter Name",
          );

          await expect(page.locator("#search-input")).toBeVisible();
        });

        test("columns button", async ({ page }) => {
          await expect(page.getByRole("button", { name: /Columns/ })).toBeVisible();
          await expect(page.getByRole("button", { name: /Columns/ })).toHaveText(
            "Columns (3 hidden)",
          );
        });

        test("filters buttons", async ({ page }) => {
          await expect(page.getByText(/Filters/)).toBeVisible();
          await expect(page.getByText(/Filters/)).toHaveText("Filters");
        });

        test("export button", async ({ page }) => {
          await expect(page.getByRole("button", { name: /Export/ })).toBeVisible();
          await expect(page.getByRole("button", { name: /Export/ })).toHaveText("Export");
        });

        test.describe("dashboard table", () => {
          test.describe("spas", () => {
            test("column headers", async ({ page }) => {
              const header = await page.locator("th");
              const count = await header.count();

              let headerValues = [];

              if (role === "helpDesk") {
                headerValues = [
                  "SPA ID",
                  "State",
                  "Authority",
                  "Status",
                  "Initial Submission",
                  "Latest Package Activity",
                  "Formal RAI Response",
                  "Submitted By",
                ];
              } else {
                headerValues = [
                  "Actions",
                  "SPA ID",
                  "State",
                  "Authority",
                  "Status",
                  "Initial Submission",
                  "Latest Package Activity",
                  "Formal RAI Response",
                  "Submitted By",
                ];
              }

              for (let i = 0; i < count; i++) {
                await expect(await header.nth(i)).toBeVisible();
                await expect(await header.nth(i).textContent()).toEqual(headerValues[i]);
              }
            });

            test("table data", async ({ page }) => {
              await expect(page.locator("tbody")).toBeVisible();
            });

            test("table footer", async ({ page }) => {
              await expect(page.getByTestId("pagination")).toBeVisible();
            });
          });

          test.describe("waivers", () => {
            test.beforeEach(async ({ page }) => {
              await page.getByRole("tab", { name: "Waivers" }).click();
            });

            test("column headers", async ({ page }) => {
              const header = await page.locator("th");
              const count = await header.count();

              let headerValues = [];

              if (role === "helpDesk") {
                headerValues = [
                  "SPA ID",
                  "State",
                  "Authority",
                  "Status",
                  "Initial Submission",
                  "Latest Package Activity",
                  "Formal RAI Response",
                  "Submitted By",
                ];
              } else {
                headerValues = [
                  "Actions",
                  "SPA ID",
                  "State",
                  "Authority",
                  "Status",
                  "Initial Submission",
                  "Latest Package Activity",
                  "Formal RAI Response",
                  "Submitted By",
                ];
              }

              for (let i = 0; i < count; i++) {
                await expect(await header.nth(i)).toBeVisible();
                await expect(await header.nth(i).textContent()).toEqual(headerValues[i]);
              }
            });

            test("table data", async ({ page }) => {
              await expect(page.locator("tbody")).toBeVisible();
            });

            test("table footer", async ({ page }) => {
              await expect(page.getByTestId("pagination")).toBeVisible();
            });
          });
        });
      });

      test.describe("Interactions", () => {
        test(`Download Exports for ${role} user`, async ({ page }, testInfo) => {
          const meta = getMetadataByFile(testInfo.file!);

          if (meta) {
            testInfo.attach("metadata", {
              body: JSON.stringify(meta, null, 2),
              contentType: "application/json",
            });
          }

          const today = new Date();
          const yyyy = today.getFullYear();
          const mm = String(today.getMonth() + 1).padStart(2, "0");
          const dd = String(today.getDate()).padStart(2, "0");
          const expectedFilename = `spas-export-${mm}_${dd}_${yyyy}.csv`;

          await dashboardPage.validateDownload(page, {
            role: role,
            triggerSelector: "export-csv-btn",
            expectedFilename: expectedFilename,
          });
        });
      });
    });
  });
}
