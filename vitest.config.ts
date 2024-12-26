import { join } from "path";
import { configDefaults, defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    environmentMatchGlobs: [["**/*.test.ts", "**/*.test.tsx"]],
    coverage: {
      provider: "istanbul",
      reportsDirectory: join(__dirname, "coverage"),
      reporter: ["html", "text", "json-summary", "json", "lcovonly"],
      reportOnFailure: true,
      // Merging workspace coverage reports
      enabled: true,
      clean: true, // Clean coverage reports before each run
      exclude: [
        ...configDefaults.exclude,
        ".build_run",
        ".cdk",
        "lib/libs/webforms/**",
        "react-app/src/features/webforms/**",
        "**/TestWrapper.tsx",
        "lib/stacks",
        "lib/local-aspects",
        "lib/local-constructs",
        "bin",
        "vitest.workspace.ts",
        "**/*.config.{ts,js,cjs}",
        "**/coverage/**",
        "test/e2e",
        "mocks",
        "react-app/src/assets",
        "node_modules",
        "**/node_modules",
      ],
    },
    pool: "threads", 
    poolOptions: {
      threads: {
        singleThread: false,
      },
    },
  },
});

import { Amplify } from "aws-amplify";
import {
  API_CONFIG,
  API_ENDPOINT,
  AUTH_CONFIG,
  IDENTITY_POOL_ID,
  OPENSEARCH_DOMAIN,
  OPENSEARCH_INDEX_NAMESPACE,
  PROJECT,
  REGION,
  STAGE,
  USER_POOL_CLIENT_DOMAIN,
  USER_POOL_CLIENT_ID,
  USER_POOL_ID,
  setDefaultStateSubmitter,
} from "mocks";
import { mockedServiceServer as mockedServer } from "mocks/server";
import { afterAll, afterEach, beforeAll, beforeEach, vi } from "vitest";

Amplify.configure({
  API: API_CONFIG,
  Auth: AUTH_CONFIG,
});

beforeAll(() => {
  setDefaultStateSubmitter();

  vi.spyOn(console, "error").mockImplementation(() => {});

  console.log("starting MSW listener for lib tests");
  mockedServer.listen({
    onUnhandledRequest: "warn",
  });
});

beforeEach(() => {
  process.env.PROJECT = PROJECT;
  process.env.REGION_A = REGION;
  process.env.STAGE = STAGE;
  process.env.isDev = "true";

  process.env.project = PROJECT;
  process.env.region = REGION;
  process.env.stage = STAGE;

  process.env.applicationEndpointUrl = API_ENDPOINT;
  process.env.identityPoolId = IDENTITY_POOL_ID;
  process.env.userPoolId = USER_POOL_ID;
  process.env.idmClientId = USER_POOL_CLIENT_ID;
  process.env.idmClientIssuer = USER_POOL_CLIENT_DOMAIN;
  process.env.osDomain = OPENSEARCH_DOMAIN;
  process.env.indexNamespace = OPENSEARCH_INDEX_NAMESPACE;
});

afterEach(() => {
  vi.useRealTimers();
  vi.clearAllMocks();

  setDefaultStateSubmitter();
  mockedServer.resetHandlers();
});

afterAll(() => {
  vi.clearAllMocks();
  mockedServer.close();
});
