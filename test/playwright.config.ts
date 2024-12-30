import { defineConfig, devices } from "@playwright/test";
import dotenv from "dotenv";

// Load environment variables from .env if present
dotenv.config();

/**
 * We'll read a baseURL from the environment, or default to localhost:5000.
 */
const baseURL = process.env.BASE_URL || "http://localhost:5000";

/**
 * See https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  // Our main test directory
  testDir: "e2e", // so we can locate "tests" and "utils" inside "e2e"
  /* Run tests in files in parallel */
  fullyParallel: true,
  /* Fail the build on CI if test.only is left in the code */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  /* Limit concurrency on CI */
  workers: process.env.CI ? 4 : undefined,
  // Minimal reporter; you could also chain reporters if needed
  reporter: [["list"], ["json", { outputFile: "e2e/playwright-report/index.html" }]],
  // Shared settings
  use: {
    baseURL,
    trace: "on-first-retry",
  },

  projects: [
    // Setup project that authenticates users
    {
      name: "setup",
      // We'll only run "utils/auth.ts" under e2e
      testMatch: ["utils/auth.ts"],
      // No parallel runs for setup
      fullyParallel: false,
    },
    // Main test project for the state user
    {
      name: "state-user-chrome",
      // We'll run the rest of the .spec.ts tests under e2e/tests
      testMatch: ["tests/**/*.spec.ts"],
      use: {
        ...devices["Desktop Chrome"],
        // Use the stored state from the setup project
        storageState: "./playwright/.auth/user.json",
      },
      // This ensures "setup" runs first
      dependencies: ["setup"],
    },
  ],
});
