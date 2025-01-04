import { defineConfig, devices } from "@playwright/test";
import { GetParameterCommand, SSMClient } from "@aws-sdk/client-ssm";
/**
 * See https://playwright.dev/docs/test-configuration.
 */

const baseURL = process.env.STAGE_NAME
  ? JSON.parse(
      (
        await new SSMClient({ region: "us-east-1" }).send(
          new GetParameterCommand({
            Name: `/${process.env.PROJECT}/${baseURL ? baseURL : "main"}/deployment-output`,
          }),
        )
      ).Parameter!.Value!,
    ).applicationEndpointUrl
  : "http://localhost:5000";

console.log(`Playwright configured to run against ${baseURL}`);
export default defineConfig({
  // need to find a reasonable timeout less than 30s
  timeout: 10_000,
  testDir: ".",

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
  reporter: ["dot", "html", "json", "json-summary", "lcovonly"],
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
    // Setup project
    { name: "setup", testMatch: "utils/auth.setup.ts", fullyParallel: true, maxWorkers: 20 },

    {
      // we can have different projects for different users/use cases
      name: "state-user-chrome",
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
