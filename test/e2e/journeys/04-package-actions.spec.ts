import { expect, expectDownloadOrPopup, test } from "../../fixtures/test";

const isDeployed =
  process.env.E2E_TIER === "deployed" ||
  (!!process.env.E2E_BASE_URL && process.env.E2E_TIER !== "mocked");

test.describe("Package actions", () => {
  test("downloads an attachment and withdraws the package", async ({ page, pkg }) => {
    test.skip(!pkg.id, "No package id available (deployed create step may have failed)");
    if (isDeployed) {
      test.slow();
    }
    test.setTimeout(isDeployed ? 180_000 : 60_000);

    const detailsPath = `/details/${encodeURIComponent(pkg.authority)}/${encodeURIComponent(pkg.id)}`;
    await page.goto(detailsPath);

    await expect(page.getByRole("heading", { name: /Medicaid SPA Package Details/i })).toBeVisible({
      timeout: 30_000,
    });

    // Single-file download from Package Activity
    await expect(page.getByRole("heading", { name: /Package Activity/i })).toBeVisible();
    const result = await expectDownloadOrPopup(page, async () => {
      await page.getByRole("button", { name: /cms-179\.pdf|spa-pages\.pdf/i }).first().click();
    });
    expect(["download", "popup", "fallback"]).toContain(result.kind);

    // Close any download popup so the opener page stays focused for the withdraw flow.
    for (const openPage of page.context().pages()) {
      if (openPage !== page && !openPage.isClosed()) {
        await openPage.close().catch(() => undefined);
      }
    }

    await expect(page.getByRole("link", { name: /Withdraw Package/i })).toBeVisible({
      timeout: 15_000,
    });
    await page.getByRole("link", { name: /Withdraw Package/i }).click();
    await expect(page.getByRole("heading", { name: /Withdraw Medicaid SPA/i })).toBeVisible();

    await page
      .getByLabel(/Explain your need for withdrawal/i)
      .fill("E2E withdrawal reason for journey coverage.");

    await page.getByTestId("submit-action-form").click();
    await expect(page.getByRole("button", { name: /Yes, withdraw package/i })).toBeVisible();
    await page.getByRole("button", { name: /Yes, withdraw package/i }).click();

    await expect(page).toHaveURL(/\/details\//, { timeout: isDeployed ? 120_000 : 45_000 });
    await expect(page.getByTestId("banner-header")).toHaveText(
      /Withdraw package request has been submitted/i,
      { timeout: 15_000 },
    );
  });
});
