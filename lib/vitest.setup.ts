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

// { username: '53832e35-1fbe-4c74-9111-4a0cd29ce2cf' }
// getAuthDetails event:  {"requestContext":{"identity":{"cognitoAuthenticationProvider":"https://cognito-idp.us-east-1.amazonaws.com/us-east-1_userPool1,https://cognito-idp.us-east-1.amazonaws.com/us-east-1_userPool1:CognitoSignIn:53832e35-1fbe-4c74-9111-4a0cd29ce2cf"}}}
// {
//   authDetails: {
//     userId: '53832e35-1fbe-4c74-9111-4a0cd29ce2cf',
//     poolId: 'us-east-1_userPool1'
//   }
// }
// defaultApiTokenHandler:  {}
// defaultSecurityCredentialsHandler:  {}
// defaultSecurityCredentialsHandler:  {}

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
  process.env.emailAddressLookupSecretName = "mock-email-secret"; // pragma: allowlist secret
  process.env.DLQ_URL = "https://sqs.us-east-1.amazonaws.com/123/test";
  process.env.configurationSetName = "SES";
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
