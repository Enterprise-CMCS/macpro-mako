import path from "node:path";
import { fileURLToPath } from "node:url";

import { defineConfig, devices, type PlaywrightTestConfig } from "@playwright/test";

import { mockEnvVariables } from "../bin/cli/src/lib/consts";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const isCI = !!process.env.CI;
const isDeployed = process.env.E2E_TIER === "deployed" || !!process.env.E2E_BASE_URL;

const MOCKED_BASE_URL = "http://localhost:5000";
const AUTH_DIR = path.join(__dirname, ".auth");

/** Strip surrounding quotes from mockEnvVariables values for process.env. */
function unquoteEnv(vars: Record<string, string>): Record<string, string> {
  return Object.fromEntries(
    Object.entries(vars).map(([key, value]) => [key, value.replace(/^"(.*)"$/, "$1")]),
  );
}

function resolveBaseURL(): string {
  if (isDeployed) {
    const baseUrl = process.env.E2E_BASE_URL;
    if (!baseUrl) {
      throw new Error("E2E_BASE_URL is required for the deployed e2e tier");
    }
    return baseUrl.replace(/\/$/, "");
  }
  return MOCKED_BASE_URL;
}

const mockedEnv = unquoteEnv(mockEnvVariables);

export default defineConfig({
  testDir: "./e2e",
  testMatch: "**/*.spec.ts",
  fullyParallel: true,
  forbidOnly: isCI,
  retries: isCI ? 1 : 0,
  workers: isCI ? 2 : undefined,
  timeout: isDeployed ? 120_000 : 30_000,
  expect: { timeout: 10_000 },
  // Agents replay from cache in CI; local runs can override with --run-agents=missing.
  // @ts-expect-error runAgents is supported at runtime in Playwright 1.58+
  runAgents: "none",
  reporter: isCI ? [["blob"], ["github"]] : [["list"], ["html", { open: "never" }]],
  use: {
    ...devices["Desktop Chrome"],
    baseURL: resolveBaseURL(),
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    video: "off",
    testIdAttribute: "data-testid",
  },
  webServer: isDeployed
    ? undefined
    : {
        command: "bun run e2e:serve",
        cwd: path.join(__dirname, "../react-app"),
        url: MOCKED_BASE_URL,
        reuseExistingServer: !isCI,
        timeout: 120_000,
        env: {
          ...process.env,
          ...mockedEnv,
          // Prefer Cognito tokens from Playwright storage state; keep a default for non-E2E.
          VITE_MOCK_USER_USERNAME: "cd400c39-9e7c-4341-b62f-234e2ecb339d",
        },
      },
  projects: [
    {
      name: "mocked-setup",
      testMatch: /setup\/auth\.setup\.ts/,
      use: {
        baseURL: MOCKED_BASE_URL,
        serviceWorkers: "block",
      },
    },
    {
      name: "mocked",
      dependencies: ["mocked-setup"],
      testMatch: /journeys\/.*\.spec\.ts/,
      grepInvert: /@quarantine/,
      use: {
        baseURL: MOCKED_BASE_URL,
        storageState: path.join(AUTH_DIR, "mocked", "state-submitter.json"),
        serviceWorkers: "block",
      },
    },
    {
      name: "deployed-setup",
      testMatch: /setup\/auth\.setup\.ts/,
      use: {
        baseURL: resolveBaseURL(),
      },
    },
    {
      name: "deployed-create",
      dependencies: ["deployed-setup"],
      testMatch: /journeys\/02-submit-medicaid-spa\.spec\.ts/,
      grepInvert: /@quarantine/,
      use: {
        baseURL: resolveBaseURL(),
        storageState: path.join(AUTH_DIR, "deployed", "state-submitter.json"),
      },
    },
    {
      name: "deployed-read",
      dependencies: ["deployed-create"],
      testMatch: /journeys\/(01-sign-in|03-submission-records|05-attachment-downloads)\.spec\.ts/,
      grepInvert: /@quarantine/,
      use: {
        baseURL: resolveBaseURL(),
        storageState: path.join(AUTH_DIR, "deployed", "state-submitter.json"),
      },
    },
    {
      name: "deployed-mutate",
      dependencies: ["deployed-read"],
      testMatch: /journeys\/04-package-actions\.spec\.ts/,
      grepInvert: /@quarantine/,
      use: {
        baseURL: resolveBaseURL(),
        storageState: path.join(AUTH_DIR, "deployed", "state-submitter.json"),
      },
    },
  ],
}) satisfies PlaywrightTestConfig;
