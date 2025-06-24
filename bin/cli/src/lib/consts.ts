if (!process.env.PROJECT) {
  throw new Error("PROJECT environment variable is required but not set");
}
export const project = process.env.PROJECT;

if (!process.env.REGION_A) {
  throw new Error("REGION_A environment variable is required but not set");
}
export const region = process.env.REGION_A;

export const mockEnvs = {
  PROJECT: "mako",
  REGION: "us-east-1",
  API_ENDPOINT: "https://test-domain.execute-api.us-east-1.amazonaws.com/mocked-tests",
  IDENTITY_POOL_ID: "us-east-1:test-identity-pool-id",
  USER_POOL_ID: "us-east-1_userPool1",
  USER_POOL_CLIENT_ID: "userPoolWebClientId",
  USER_POOL_CLIENT_DOMAIN:
    "mocked-tests-login-userPoolWebClientId.auth.us-east-1.amazoncognito.com",
  IDM_HOME_URL: "https://test.home.idm.cms.gov",
  LAUNCHDARKLY_CLIENT_ID: "6638280397c1bc569aea5f3f",
};
