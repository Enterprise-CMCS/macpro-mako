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
  ATTACHMENT_BUCKET_NAME,
  ATTACHMENT_BUCKET_REGION,
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
  process.env.attachmentsBucketName = ATTACHMENT_BUCKET_NAME;
  process.env.attachmentsBucketRegion = ATTACHMENT_BUCKET_REGION;
  process.env.emailAddressLookupSecretName = "mock-email-secret"; // pragma: allowlist secret
  process.env.DLQ_URL = "https://sqs.us-east-1.amazonaws.com/123/test";
  process.env.configurationSetName = "SES";
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
