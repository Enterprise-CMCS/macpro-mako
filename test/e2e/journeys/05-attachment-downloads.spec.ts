import { expect, expectDownloadOrPopup, test } from "../../fixtures/test";

const isDeployed =
  process.env.E2E_TIER === "deployed" ||
  (!!process.env.E2E_BASE_URL && process.env.E2E_TIER !== "mocked");

test.describe("Attachment downloads", () => {
  test("downloads section and all attachment archives", async ({ page, pkg }) => {
    expect(pkg.id, "No package id available (deployed create step may have failed)").toBeTruthy();
    if (isDeployed) {
      test.slow();
    }
    test.setTimeout(isDeployed ? 180_000 : 60_000);

    const detailsPath = `/details/${encodeURIComponent(pkg.authority)}/${encodeURIComponent(pkg.id)}`;
    await page.goto(detailsPath);

    await expect(page.getByRole("heading", { name: /Medicaid SPA Package Details/i })).toBeVisible({
      timeout: 30_000,
    });
    await expect(page.getByRole("heading", { name: /Package Activity/i })).toBeVisible();

    const sectionDownload = await expectDownloadOrPopup(page, async () => {
      await page.getByRole("button", { name: /Download section attachments/i }).click();
    });
    expect(["download", "popup", "fallback"]).toContain(sectionDownload.kind);
    if (sectionDownload.filename) {
      expect(sectionDownload.filename).toMatch(/\.zip$/i);
    }

    // Wait for the first archive request to finish so the button re-enables.
    await expect(page.getByRole("button", { name: /Download all attachments/i })).toBeEnabled({
      timeout: 20_000,
    });

    const allDownload = await expectDownloadOrPopup(page, async () => {
      await page.getByRole("button", { name: /Download all attachments/i }).click();
    });
    expect(["download", "popup", "fallback"]).toContain(allDownload.kind);
    if (allDownload.filename) {
      expect(allDownload.filename).toMatch(/\.zip$/i);
    }
  });
});
