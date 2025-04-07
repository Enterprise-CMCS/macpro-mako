import { GetParameterCommand, SSMClient } from "@aws-sdk/client-ssm";
import { defineConfig, devices } from "@playwright/test";
import { TEST_ITEM_ID } from "mocks";
/**
 * See https://playwright.dev/docs/test-configuration.
 */

const baseURL = process.env.STAGE_NAME
  ? JSON.parse(
      (
        await new SSMClient({ region: "us-east-1" }).send(
          new GetParameterCommand({
            Name: `/${process.env.PROJECT}/${process.env.STAGE_NAME || "main"}/deployment-output`,
          }),
        )
      ).Parameter!.Value!,
    ).applicationEndpointUrl
  : "http://localhost:5000";

console.log(`Playwright configured to run against ${baseURL}`);
export default defineConfig({
  // Global setup
  globalSetup: "./utils/auth.setup.ts",

  // need to find a reasonable timeout less than 30s
  // timeout: 10_000,
  testDir: "../../test",
  /* Run tests in files in parallel */
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  /* Opt out of parallel tests on CI. */
  workers: process.env.CI ? 1 : undefined,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  // reporter: [["dot"], ["html"]],
  reporter: process.env.CI
    ? [
        ["github"],
        ["html", { outputFolder: "playwright-reports/html-report", open: "never" }],
        ["json", { outputFile: "playwright-reports/playwright-summary.json" }],
      ]
    : [["dot"]],
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Base URL to use in actions like `await page.goto('/')`. */
    baseURL,

    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: "on-first-retry",
  },

  /* Configure projects for major browsers */
  // Note: we can test on multiple browsers and resolutions defined here
  projects: [
    {
      // we can have different projects for different users/use cases
      name: "state-user-chrome",
      use: {
        ...devices["Desktop Chrome"],
        // Use prepared auth state for state submitter.
        storageState: "playwright/.auth/state-user.json",
      },
    },
  ],
});
