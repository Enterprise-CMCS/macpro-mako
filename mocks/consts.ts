export const PROJECT = "mako";
export const REGION = "us-east-1";
export const STAGE = "mocked-tests";
export const API_ENDPOINT = `https://test-domain.execute-api.${REGION}.amazonaws.com/mocked-tests`;
export const IDENTITY_POOL_ID = `${REGION}:test-identity-pool-id`;
export const USER_POOL_ID = `${REGION}_userPool1`;
export const USER_POOL_CLIENT_ID = "userPoolWebClientId";
export const USER_POOL_CLIENT_DOMAIN = `mocked-tests-login-${USER_POOL_CLIENT_ID}.auth.${REGION}.amazoncognito.com`;
export const COGNITO_IDP_DOMAIN = `https://cognito-idp.${REGION}.amazonaws.com/${USER_POOL_ID}`;
export const OPENSEARCH_DOMAIN = `https://vpc-opensearchdomain-mock-domain.${REGION}.es.amazonaws.com`;
export const OPENSEARCH_INDEX_NAMESPACE = "test-namespace-";

export const ACCESS_KEY_ID = "ASIAZHXA3XOU7XZ53M36"; // pragma: allowlist secret
export const SECRET_KEY = "UWKCFxhrgbPnixgLnL1JKwFEwiK9ZKvTAtpk8cGa"; // pragma: allowlist secret

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
  userPoolId: USER_POOL_ID,
  identityPoolId: IDENTITY_POOL_ID,
  userPoolWebClientId: USER_POOL_CLIENT_ID,
  oauth: {
    domain: USER_POOL_CLIENT_DOMAIN,
    redirectSignIn: "http://localhost",
    redirectSignOut: "http://localhost",
    scope: ["email", "openid"],
    responseType: "code",
  },
};
