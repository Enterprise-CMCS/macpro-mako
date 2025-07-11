if (!process.env.PROJECT) {
  throw new Error("PROJECT environment variable is required but not set");
}
export const project = process.env.PROJECT;

if (!process.env.REGION_A) {
  throw new Error("REGION_A environment variable is required but not set");
}
export const region = process.env.REGION_A;

export const mockEnvVariables = {
  VITE_API_REGION: `"us-east-1"`,
  VITE_API_URL: `"https://test-domain.execute-api.us-east-1.amazonaws.com/mocked-tests"`,
  VITE_NODE_ENV: `"development"`,
  VITE_COGNITO_REGION: `"us-east-1"`,
  VITE_COGNITO_IDENTITY_POOL_ID: `"us-east-1::test-identity-pool-id"`,
  VITE_COGNITO_USER_POOL_ID: `"us-east-1_userPool1"`,
  VITE_COGNITO_USER_POOL_CLIENT_ID: `"userPoolWebClientId"`,
  VITE_COGNITO_USER_POOL_CLIENT_DOMAIN: `"mocked-tests-login-userPoolWebClientId.auth.us-east-1.amazoncognito.com"`,
  VITE_COGNITO_REDIRECT_SIGNIN: `"http://localhost:5000/dashboard"`,
  VITE_COGNITO_REDIRECT_SIGNOUT: `"http://localhost:5000/"`,
  VITE_IDM_HOME_URL: `"https://test.home.idm.cms.gov"`,
  VITE_GOOGLE_ANALYTICS_GTAG: `""`,
  VITE_GOOGLE_ANALYTICS_DISABLE: `"true"`,
  VITE_LAUNCHDARKLY_CLIENT_ID: `"6638280397c1bc569aea5f3f"`,
};
