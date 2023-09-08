import { defineConfig, devices } from "@playwright/test";
import fs from "fs";

import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
console.log(
  `Loading .env.local from: ${path.resolve(__dirname, ".env.local")}`
);
dotenv.config({ path: path.resolve(__dirname, ".env.local") });
console.log("inside playwright", process.env.BOOTSTRAP_USERS_PW);

const envFilePath = path.resolve(__dirname, ".env.local");

const filesInDirectory = fs.readdirSync(__dirname);
const filesInDirectory2 = fs.readdirSync(`${__dirname}/src`);
const filesInDirectory3 = fs.readdirSync(`${__dirname}/e2e`);
console.log("Files in the directory:", filesInDirectory);
console.log("Files in the directory:", filesInDirectory2);
console.log("Files in the directory:", filesInDirectory3);

// Check if the file exists
if (fs.existsSync(envFilePath)) {
  // The .env.local file exists, so load its content
  console.log("TEST, FILE WAS FOUND", fs.existsSync(envFilePath));
  dotenv.config({ path: envFilePath });
} else {
  console.error(`The .env.local file does not exist at ${envFilePath}`);
}

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
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
    {
      name: "firefox",
      use: { ...devices["Desktop Firefox"] },
    },

    {
      name: "webkit",
      use: { ...devices["Desktop Safari"] },
    },
  ],
});
