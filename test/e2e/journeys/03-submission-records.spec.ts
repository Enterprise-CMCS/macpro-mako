import { expect, test } from "../../fixtures/test";

const isDeployed =
  process.env.E2E_TIER === "deployed" ||
  (!!process.env.E2E_BASE_URL && process.env.E2E_TIER !== "mocked");

test.describe("Submission records", () => {
  test("finds a package on the dashboard and opens package details", async ({ page, pkg }) => {
    test.skip(!pkg.id, "No package id available (deployed create step may have failed)");
    if (isDeployed) {
      test.slow();
    }

    await page.goto("/dashboard?tab=spas");
    await expect(page.getByRole("heading", { name: "Dashboard" })).toBeVisible();
    await expect(page.getByRole("tab", { name: "SPAs" })).toBeVisible();

    const search = page.getByRole("textbox", {
      name: /Search by Package ID, CPOC Name, or Submitter Name/i,
    });
    await search.fill(pkg.id);
    // Dashboard search is debounced (~750ms).
    await expect(page.getByRole("link", { name: pkg.id })).toBeVisible({ timeout: 15_000 });

    await page.getByRole("link", { name: pkg.id }).click();

    await expect(page.getByRole("heading", { name: /Medicaid SPA Package Details/i })).toBeVisible({
      timeout: 30_000,
    });
    await expect(page.getByText("Submission ID")).toBeVisible();
    await expect(page.getByText(pkg.id, { exact: true }).first()).toBeVisible();
    await expect(page.getByText("State", { exact: true }).first()).toBeVisible();
    await expect(page.getByText("Proposed Effective Date")).toBeVisible();
  });
});
