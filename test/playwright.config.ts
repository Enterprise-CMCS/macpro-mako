import { defineConfig, devices, PlaywrightTestConfig } from "@playwright/test";

import { getDeploymentOutput } from "./lib/auth.secrets";
/**
 * See https://playwright.dev/docs/test-configuration.
 */

const stage = process.env.STAGE_NAME || "main";
const project = process.env.PROJECT;
const deploymentOutput = await getDeploymentOutput(stage, project);

export default defineConfig({
  testDir: "./",
  testMatch: "**/*.spec.ts",
  testIgnore: "**/*.test.{ts,tsx}",
  globalTeardown: "./lib/global.teardown.ts",
  // need to find a reasonable timeout less than 30s
  // timeout: 10_000,
  /* Run tests in files in parallel */
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  /* Opt out of parallel tests on CI. */
  // workers: process.env.CI ? 1 : undefined,
  workers: 1,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  // reporter: [["dot"], ["html"]],
  reporter: process.env.CI
    ? [
        ["github"],
        [
          "html",
          {
            outputFolder: "./playwright-reports/html-report",
            open: "never",
          },
        ],
        ["json", { outputFile: "./playwright-reports/playwright-summary.json" }],
      ]
    : [["dot"]],
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Base URL to use in actions like `await page.goto('/')`. */
    // baseURL,
    ...devices["Desktop Chrome"],
    /* Collect trace for test failures. See https://playwright.dev/docs/trace-viewer */
    trace: "retain-on-failure",
    /* Save the videos for test failures. See https://playwright.dev/docs/videos */
    video: "retain-on-failure",
    // video: "on",
    // storageState: "./playwright/.auth/state-user.json",
  },
  /* Configure projects for major browsers */
  // Note: we can test on multiple browsers and resolutions defined here

  projects: [
    {
      name: "local-setup",
      testMatch: /local\.setup\.ts/,
    },
    {
      name: "ci-setup",
      testMatch: /ci\.setup\.ts/,
    },
    {
      name: "eua-setup",
      testMatch: /eua\.setup\.ts/,
    },
    {
      name: "mfa-setup",
      testMatch: /mfa\.setup\.ts/,
    },
    {
      name: "local",
      use: {
        baseURL: "http://localhost:5000",
        storageState: "./playwright/.auth/state-user.json",
      },
      dependencies: ["local-setup"],
    },
    {
      name: "ci",
      use: {
        storageState: "./playwright/.auth/state-user.json",
        baseURL: deploymentOutput.applicationEndpointUrl,
      },
      dependencies: ["ci-setup"],
    },
    {
      name: "eua-user",
      use: {
        baseURL: "https://mako.cms.gov",
        storageState: "./playwright/.auth/eua-user.json",
      },
      dependencies: ["eua-setup"],
    },
    {
      name: "mfa-user",
      use: {
        baseURL: "https://mako.cms.gov",
        storageState: "./playwright/.auth/zzState-user.json",
      },
      dependencies: ["mfa-setup"],
    },
  ],
}) satisfies PlaywrightTestConfig;
