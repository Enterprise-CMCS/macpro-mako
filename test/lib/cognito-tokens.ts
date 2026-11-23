import * as jose from "jose";

import { ALGORITHM, COGNITO_IDP_DOMAIN, JWK, KEY, USER_POOL_CLIENT_ID } from "../../mocks/consts";
import { reviewers } from "../../mocks/data/users/cmsReviewer";
import { stateSubmitters } from "../../mocks/data/users/stateSubmitters";
import type { TestUserDataWithRole } from "../../mocks/index.d";

const allUsers: TestUserDataWithRole[] = [...stateSubmitters, ...reviewers];

let privateKey: jose.CryptoKey | Uint8Array | undefined;

async function getPrivateKey() {
  if (!privateKey) {
    privateKey = await jose.importJWK(JWK, ALGORITHM);
  }
  return privateKey;
}

export function findMockUser(username: string): TestUserDataWithRole | undefined {
  return allUsers.find((user) => user.Username === username);
}

export function getAttribute(user: TestUserDataWithRole, attrName: string): string | null {
  const attribute = user.UserAttributes?.find((attr) => attr?.Name === attrName);
  return attribute?.Value || null;
}

export function toFullUser(user: TestUserDataWithRole) {
  const attrs = (user.UserAttributes || []).reduce(
    (obj, item) =>
      item?.Name && item?.Value
        ? {
            ...obj,
            [item.Name]: item.Value,
          }
        : obj,
    {} as Record<string, string>,
  );

  return {
    ...attrs,
    "custom:cms-roles": attrs["custom:cms-roles"] || "",
    username: user.Username || "",
    role: user.role,
    states: user.states,
  };
}

export async function generateAccessToken(
  user: TestUserDataWithRole,
  authTime: number,
  expTime: number,
): Promise<string> {
  return new jose.SignJWT({
    sub: getAttribute(user, "sub") || undefined,
    iss: COGNITO_IDP_DOMAIN,
    version: 2,
    client_id: USER_POOL_CLIENT_ID,
    origin_jti: "93879f74-bbfa-4db6-8d75-e97b28e7bb5c",
    token_use: "access",
    scope: "aws.cognito.signin.user.admin openid email",
    auth_time: authTime,
    exp: expTime,
    iat: authTime,
    jti: "38ea8a6a-64de-44c8-9257-6981fc26ea41",
    username: user.Username,
  })
    .setProtectedHeader({ alg: ALGORITHM })
    .setIssuedAt()
    .setIssuer(COGNITO_IDP_DOMAIN)
    .setAudience(USER_POOL_CLIENT_ID)
    .setExpirationTime("30m")
    .sign(await getPrivateKey());
}

export async function generateIdToken(
  user: TestUserDataWithRole,
  authTime: number,
  expTime: number,
): Promise<string> {
  return new jose.SignJWT({
    at_hash: "test_hash_not_sure_how_it_looks",
    sub: getAttribute(user, "sub") || undefined,
    email_verified: getAttribute(user, "email_verified") === "true",
    iss: COGNITO_IDP_DOMAIN,
    "cognito:username": user.Username,
    origin_jti: "93879f74-bbfa-4db6-8d75-e97b28e7bb5c",
    aud: USER_POOL_CLIENT_ID,
    token_use: "id",
    auth_time: authTime,
    exp: expTime,
    iat: authTime,
    jti: "aa2f38b9-5169-46f4-9982-aaa660e2fc11",
    email: getAttribute(user, "email"),
  })
    .setProtectedHeader({ alg: ALGORITHM })
    .setIssuedAt()
    .setIssuer(COGNITO_IDP_DOMAIN)
    .setAudience(USER_POOL_CLIENT_ID)
    .setExpirationTime("30m")
    .sign(await getPrivateKey());
}

export async function generateRefreshToken(user: TestUserDataWithRole): Promise<string> {
  return new jose.SignJWT({
    sub: getAttribute(user, "sub") || undefined,
    "cognito:username": user.Username,
  })
    .setProtectedHeader({ alg: ALGORITHM })
    .setExpirationTime("30m")
    .sign(await getPrivateKey());
}

export { KEY, USER_POOL_CLIENT_ID, COGNITO_IDP_DOMAIN };
