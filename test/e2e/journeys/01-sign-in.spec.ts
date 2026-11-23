import { expect, test } from "../../fixtures/test";
import { setMockUserEnv } from "../../lib/auth";

test.describe("Sign in", () => {
  // Exercise the login path; do not reuse cached storage state.
  test.use({ storageState: { cookies: [], origins: [] } });

  test("signs in through Cognito and signs out", async ({ page }) => {
    setMockUserEnv("state-submitter");

    await page.goto("/");
    await expect(page.getByRole("button", { name: /sign in|log in/i })).toBeVisible();

    await page.getByRole("button", { name: /sign in|log in/i }).click();

    await expect(page.getByRole("heading", { name: "Dashboard" })).toBeVisible({
      timeout: 30_000,
    });
    await expect(page.getByRole("button", { name: /My Account/i })).toBeVisible();

    await page.getByRole("button", { name: /My Account/i }).click();
    await page.getByText("Log Out", { exact: true }).click();

    await expect(page.getByRole("button", { name: /sign in|log in/i })).toBeVisible({
      timeout: 30_000,
    });
  });
});
