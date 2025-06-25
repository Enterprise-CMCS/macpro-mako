export const PROJECT = "mako";
export const REGION = "us-east-1";
export const STAGE = "mocked-tests";
export const API_ENDPOINT = `https://test-domain.execute-api.${REGION}.amazonaws.com/mocked-tests`;
export const IDENTITY_POOL_ID = `${REGION}:test-identity-pool-id`;
export const USER_POOL_ID = `${REGION}_userPool1`;
export const USER_POOL_CLIENT_ID = "userPoolWebClientId";
export const USER_POOL_CLIENT_DOMAIN = `mocked-tests-login-${USER_POOL_CLIENT_ID}.auth.${REGION}.amazoncognito.com`;
export const COGNITO_IDP_DOMAIN = `https://cognito-idp.${REGION}.amazonaws.com/${USER_POOL_ID}`;
export const IDM_HOME_URL = "https://test.home.idm.cms.gov";
export const LAUNCHDARKLY_CLIENT_ID = "6638280397c1bc569aea5f3f";
export const OPENSEARCH_DOMAIN = `https://vpc-opensearchdomain-mock-domain.${REGION}.es.amazonaws.com`;
export const OPENSEARCH_INDEX_NAMESPACE = "test-namespace-";
export const CLOUDFORMATION_NOTIFICATION_DOMAIN = "https://test-cfn.amazonaws.com";
export const BUCKET_NAME = "test-bucket";
export const BUCKET_REGION = REGION;
export const ATTACHMENT_BUCKET_NAME = "uploads-test-attachment-bucket";
export const ATTACHMENT_BUCKET_REGION = REGION;
export const KAFKA_BROKERS = "kafka1:9092,kafka2:9092";

export const ACCESS_KEY_ID = "ASIAZHXA3XOU7XZ53M36"; // pragma: allowlist secret
export const SECRET_KEY = "UWKCFxhrgbPnixgLnL1JKwFEwiK9ZKvTAtpk8cGa"; // pragma: allowlist secret

export const ALGORITHM = "RS256"; // pragma: allowlist secret
const KTY = "RSA"; // pragma: allowlist secret
const E = "AQAB"; // pragma: allowlist secret

// these these keys come from the jose example here https://github.com/panva/jose/blob/main/docs/jwt/sign/classes/SignJWT.md
// they are not real keys
const N =
  "whYOFK2Ocbbpb_zVypi9SeKiNUqKQH0zTKN1-6fpCTu6ZalGI82s7XK3tan4dJt90ptUPKD2zvxqTzFNfx4HHHsrYCf2-FMLn1VTJfQazA2BvJqAwcpW1bqRUEty8tS_Yv4hRvWfQPcc2Gc3-_fQOOW57zVy-rNoJc744kb30NjQxdGp03J2S3GLQu7oKtSDDPooQHD38PEMNnITf0pj-KgDPjymkMGoJlO3aKppsjfbt_AH6GGdRghYRLOUwQU-h-ofWHR3lbYiKtXPn5dN24kiHy61e3VAQ9_YAZlwXC_99GGtw_NpghFAuM4P1JDn0DppJldy3PGFC0GfBCZASw"; // pragma: allowlist secret

export const JWK = {
  kty: KTY,
  n: N,
  e: E,
  d: "VuVE_KEP6323WjpbBdAIv7HGahGrgGANvbxZsIhm34lsVOPK0XDegZkhAybMZHjRhp-gwVxX5ChC-J3cUpOBH5FNxElgW6HizD2Jcq6t6LoLYgPSrfEHm71iHg8JsgrqfUnGYFzMJmv88C6WdCtpgG_qJV1K00_Ly1G1QKoBffEs-v4fAMJrCbUdCz1qWto-PU-HLMEo-krfEpGgcmtZeRlDADh8cETMQlgQfQX2VWq_aAP4a1SXmo-j0cvRU4W5Fj0RVwNesIpetX2ZFz4p_JmB5sWFEj_fC7h5z2lq-6Bme2T3BHtXkIxoBW0_pYVnASC8P2puO5FnVxDmWuHDYQ", // pragma: allowlist secret
  p: "07rgXd_tLUhVRF_g1OaqRZh5uZ8hiLWUSU0vu9coOaQcatSqjQlIwLW8UdKv_38GrmpIfgcEVQjzq6rFBowUm9zWBO9Eq6enpasYJBOeD8EMeDK-nsST57HjPVOCvoVC5ZX-cozPXna3iRNZ1TVYBY3smn0IaxysIK-zxESf4pM", // pragma: allowlist secret
  q: "6qrE9TPhCS5iNR7QrKThunLu6t4H_8CkYRPLbvOIt2MgZyPLiZCsvdkTVSOX76QQEXt7Y0nTNua69q3K3Jhf-YOkPSJsWTxgrfOnjoDvRKzbW3OExIMm7D99fVBODuNWinjYgUwGSqGAsb_3TKhtI-Gr5ls3fn6B6oEjVL0dpmk", // pragma: allowlist secret
  dp: "mHqjrFdgelT2OyiFRS3dAAPf3cLxJoAGC4gP0UoQyPocEP-Y17sQ7t-ygIanguubBy65iDFLeGXa_g0cmSt2iAzRAHrDzI8P1-pQl2KdWSEg9ssspjBRh_F_AiJLLSPRWn_b3-jySkhawtfxwO8Kte1QsK1My765Y0zFvJnjPws", // pragma: allowlist secret
  dq: "KmjaV4YcsVAUp4z-IXVa5htHWmLuByaFjpXJOjABEUN0467wZdgjn9vPRp-8Ia8AyGgMkJES_uUL_PDDrMJM9gb4c6P4-NeUkVtreLGMjFjA-_IQmIMrUZ7XywHsWXx0c2oLlrJqoKo3W-hZhR0bPFTYgDUT_mRWjk7wV6wl46E", // pragma: allowlist secret
  qi: "iYltkV_4PmQDfZfGFpzn2UtYEKyhy-9t3Vy8Mw2VHLAADKGwJvVK5ficQAr2atIF1-agXY2bd6KV-w52zR8rmZfTr0gobzYIyqHczOm13t7uXJv2WygY7QEC2OGjdxa2Fr9RnvS99ozMa5nomZBqTqT7z5QV33czjPRCjvg6FcE", // pragma: allowlist secret
};

export const KEY = {
  kty: KTY,
  e: E,
  n: N,
  alg: ALGORITHM,
};

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
    redirectSignIn: "http://localhost:5000/",
    redirectSignOut: "http://localhost:5000/",
    scope: ["email", "openid"],
    responseType: "code",
  },
};
