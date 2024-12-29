import { afterAll, afterEach, beforeAll, beforeEach, vi } from "vitest";
import { mockedServiceServer as mockedServer } from "mocks/server";
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
import { Amplify } from "aws-amplify";

let originalEnv: NodeJS.ProcessEnv;

beforeAll(() => {
  originalEnv = { ...process.env };
  setDefaultStateSubmitter();
  vi.spyOn(console, "error").mockImplementation(() => {});
  mockedServer.listen({ onUnhandledRequest: "warn" });
});

beforeEach(() => {
  // Restore env variables from backup
  process.env = { ...originalEnv };

  // Set new values
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
  process.env = { ...originalEnv };
  vi.useRealTimers();
  vi.clearAllMocks();
  setDefaultStateSubmitter();
  mockedServer.resetHandlers();
});

afterAll(() => {
  process.env = { ...originalEnv };
  vi.clearAllMocks();
  mockedServer.close();
});

Amplify.configure({
  API: API_CONFIG,
  Auth: AUTH_CONFIG,
});
