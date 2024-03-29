import { defineConfig, devices } from "@playwright/test";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, ".env.local") });

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  testDir: "./e2e",
  /* Run tests in files in parallel */
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  /* Opt out of parallel tests on CI. */
  workers: process.env.CI ? 1 : undefined,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: "html",
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Base URL to use in actions like `await page.goto('/')`. */
    baseURL: process.env.baseurl || "http://localhost:5000",

    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: "on-first-retry",
  },

  /* Configure projects for major browsers */
  // Note: we can test on multiple browsers and resolutions defined here
  projects: [
    // Setup project
    { name: "setup", testMatch: /.*\.setup\.ts/, fullyParallel: true },

    {
      // we can have different projects for different users/use cases
      name: "logged in state user",
      use: {
        ...devices["Desktop Chrome"],
        // Use prepared auth state for state submitter.
        storageState: "playwright/.auth/state-user.json",
      },
      // Tests start already authenticated because we specified storageState in the config.
      dependencies: ["setup"],
    },
  ],
});
