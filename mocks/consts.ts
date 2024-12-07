export const REGION = "us-east-1";
export const API_ENDPOINT = `https://test-domain.execute-api.${REGION}.amazonaws.com/mocked-tests`;

export const API_CONFIG = {
  endpoints: [
    {
      name: "os",
      endpoint: API_ENDPOINT,
      region: REGION,
    },
  ],
};

export const AUTH_CONFIG = {
  mandatorySignIn: true,
  region: REGION,
  userPoolId: `${REGION}_userPool1`,
  identityPoolId: `${REGION}:test-identity-pool-id`,
  userPoolWebClientId: "userPoolWebClientId",
  oauth: {
    domain: `mocked-tests-login-userPoolWebClientId.auth.${REGION}.amazoncognito.com`,
    redirectSignIn: "http://localhost",
    redirectSignOut: "http://localhost",
    scope: ["email", "openid"],
    responseType: "code",
  },
};
