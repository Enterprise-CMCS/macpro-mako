import { expect, fixtureFiles, test, writeDeployedPackageState } from "../../fixtures/test";
import { uniqueSpaId } from "../../lib/ids";

const isDeployed =
  process.env.E2E_TIER === "deployed" ||
  (!!process.env.E2E_BASE_URL && process.env.E2E_TIER !== "mocked");

test.describe("Submit Medicaid SPA", () => {
  test("creates a Medicaid SPA through the happy path", async ({ page }, testInfo) => {
    if (isDeployed) {
      test.slow();
    }
    test.setTimeout(isDeployed ? 180_000 : 60_000);

    const spaId = uniqueSpaId(testInfo, "MD");

    await page.goto("/dashboard");
    await expect(page.getByRole("heading", { name: "Dashboard" })).toBeVisible();

    await page.getByRole("link", { name: /new submission/i }).click();
    await expect(page.getByRole("heading", { name: "Submission Type" })).toBeVisible();

    await page.getByRole("link", { name: /State Plan Amendment \(SPA\)/i }).click();
    await expect(page.getByRole("heading", { name: "SPA Type" })).toBeVisible();

    // Option cards expose title + description as the link accessible name.
    await page.getByRole("link", { name: /Medicaid SPA/i }).click();
    await expect(page.getByRole("heading", { name: "Medicaid SPA Type" })).toBeVisible();

    await page.getByRole("link", { name: /All Other Medicaid SPA Submissions/i }).click();
    await expect(page.getByRole("heading", { name: /Medicaid SPA Details/i })).toBeVisible();

    await page.locator("#spa-id").fill(spaId);

    await page.getByTestId("proposedEffectiveDate-datepicker").click();
    // Pick a day in the visible calendar month.
    await page.getByRole("gridcell", { name: "15" }).click();

    await page.getByTestId("cmsForm179-upload").setInputFiles(fixtureFiles.cms179);
    await page.getByTestId("spaPages-upload").setInputFiles(fixtureFiles.spaPages);
    await expect(page.getByText("cms-179.pdf")).toBeVisible({ timeout: 30_000 });
    await expect(page.getByText("spa-pages.pdf")).toBeVisible({ timeout: 30_000 });

    await expect(page.getByTestId("submit-action-form")).toBeEnabled({ timeout: 30_000 });
    await page.getByTestId("submit-action-form").click();

    await expect(page.getByTestId("banner-header")).toHaveText(/Package submitted/i, {
      timeout: isDeployed ? 120_000 : 30_000,
    });
    await expect(page).toHaveURL(/\/dashboard/);

    if (isDeployed) {
      await writeDeployedPackageState({ id: spaId, authority: "Medicaid SPA" });
    }
  });
});
