import { Amplify } from "aws-amplify";
import {
  API_CONFIG,
  AUTH_CONFIG,
  OPENSEARCH_DOMAIN,
  OPENSEARCH_INDEX_NAMESPACE,
  IDENTITY_POOL_ID,
  USER_POOL_CLIENT_ID,
  USER_POOL_CLIENT_DOMAIN,
  setDefaultStateSubmitter,
  REGION,
  PROJECT,
  STAGE,
  API_ENDPOINT,
  USER_POOL_ID,
} from "mocks";
import { mockedServer } from "mocks/server";
import { afterAll, afterEach, beforeAll, beforeEach, vi } from "vitest";

// TODO to mock
// defaultApiTokenHandler:  {}
// [MSW] Warning: intercepted a request without a matching request handler:
//   • GET http://169.254.169.254/latest/meta-data/iam/security-credentials/

// starting MSW listener for lib tests
// stdout | local-constructs/manage-users/src/manageUsers.test.ts > Cognito User Lambda Handler > should handle errors and send FAILED response
// Error: Failed to get secret
//     at /home/runner/work/macpro-mako/macpro-mako/lib/local-constructs/manage-users/src/manageUsers.test.ts:126:37
//     at file:///home/runner/work/macpro-mako/macpro-mako/node_modules/@vitest/runner/dist/index.js:146:14
//     at file:///home/runner/work/macpro-mako/macpro-mako/node_modules/@vitest/runner/dist/index.js:529:11
//     at runWithTimeout (file:///home/runner/work/macpro-mako/macpro-mako/node_modules/@vitest/runner/dist/index.js:61:7)
//     at runTest (file:///home/runner/work/macpro-mako/macpro-mako/node_modules/@vitest/runner/dist/index.js:982:17)
//     at processTicksAndRejections (node:internal/process/task_queues:95:5)
//     at runSuite (file:///home/runner/work/macpro-mako/macpro-mako/node_modules/@vitest/runner/dist/index.js:1131:15)
//     at runSuite (file:///home/runner/work/macpro-mako/macpro-mako/node_modules/@vitest/runner/dist/index.js:1131:15)
//     at runFiles (file:///home/runner/work/macpro-mako/macpro-mako/node_modules/@vitest/runner/dist/index.js:1188:5)
//     at startTests (file:///home/runner/work/macpro-mako/macpro-mako/node_modules/@vitest/runner/dist/index.js:1197:3)
//  ✓ |lib| local-constructs/manage-users/src/manageUsers.test.ts  (2 tests) 15ms

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
  process.env.isDev = true;

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

  // process.env.attachmentsBucketName = "test-bucket";
  // process.env.attachmentsBucketRegion = REGION;
  // process.env.brokerString = "broker1,broker2";

  // process.env.legacyS3AccessRoleArn = "legacyS3AccessRoleArn";
  // process.env.idmAuthzApiKeyArn = "idmAuthzApiKeyArn"; // pragma: allowlist secret
  // process.env.idmAuthzApiEndpoint = API_ENDPOINT;
  // process.env.idmClientSecretArn = "idmClientSecretArn"; // pragma: allowlist secret
  // process.env.idmEnable = "false";
  // process.env.idmHomeUrl = "https://test.home.idm.cms.gov";
  //bucket
  //topicName
  // process.env.emailAddressLookupSecretName!;
  // process.env.configurationSetName!;
  // process.env.STATUS_CLEAN_FILE = "CLEAN";
  // process.env.STATUS_INFECTED_FILE = "INFECTED";
  // process.env.STATUS_ERROR_PROCESSING_FILE = "ERROR";
  // process.env.STATUS_SKIPPED_FILE = "SKIPPED";
  // process.env.STATUS_EXTENSION_MISMATCH_FILE = "EXTMISMATCH";
  // process.env.STATUS_UNKNOWN_EXTENSION = "UKNOWNEXT";
  // process.env.STATUS_TOO_BIG = "TOOBIG";
  // process.env.VIRUS_SCAN_STATUS_KEY = "virusScanStatus";
  // process.env.VIRUS_SCAN_TIMESTAMP_KEY = "virusScanTimestamp";
  // process.env.MAX_FILE_SIZE = "314572800";
  // process.env.DLQ_URL!;
  // process.env.ATTACHMENTS_BUCKET!;
  // process.env.CLAMAV_BUCKET_NAME!;
  // process.env.PATH_TO_AV_DEFINITIONS!;
});

afterEach(() => {
  vi.useRealTimers();
  vi.clearAllMocks();

  setDefaultStateSubmitter();
  // Reset any request handlers that we may add during the tests,
  // so they don't affect other tests.
  mockedServer.resetHandlers();
});

afterAll(() => {
  vi.clearAllMocks();

  // Clean up after the tests are finished.
  mockedServer.close();
});
