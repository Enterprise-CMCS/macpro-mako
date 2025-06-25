import * as jose from "jose";
import { CognitoUserAttributes, FullUser } from "shared-types";

import { ALGORITHM, COGNITO_IDP_DOMAIN, JWK, KEY, USER_POOL_CLIENT_ID } from "../consts";
import { getUserByUsername, testReviewer, testStateSubmitter, userResponses } from "../data/users";
import type { TestUserDataWithRole } from "../index.d";

let privateKey: jose.CryptoKey | Uint8Array; // pragma: allowlist secret

const getPrivateKey = async (): Promise<jose.CryptoKey | Uint8Array> => {
  if (privateKey) {
    return privateKey;
  }
  privateKey = await jose.importJWK(JWK, ALGORITHM); // pragma: allowlist secret
  return privateKey;
};

const getPublicKey = async () => jose.createLocalJWKSet({ keys: [KEY] }); // pragma: allowlist secret

export const getPayloadFromAccessToken = async (
  accessToken?: string,
): Promise<jose.JWTPayload | undefined> => {
  if (!accessToken) {
    return undefined;
  }

  const publicKey = await getPublicKey();
  const { payload } = await jose.jwtVerify(accessToken, publicKey, {
    issuer: COGNITO_IDP_DOMAIN,
    audience: USER_POOL_CLIENT_ID,
  });
  return payload;
};

export const getUsernameFromAccessToken = async (
  accessToken?: string,
): Promise<string | undefined> => {
  const payload = await getPayloadFromAccessToken(accessToken);

  if (payload) {
    return payload?.username as string;
  }

  return undefined;
};

export const generateIdToken = async (
  user: TestUserDataWithRole,
  authTime: number,
  expTime: number,
): Promise<string | null> => {
  if (user) {
    const jwt = await new jose.SignJWT({
      at_hash: "test_hash_not_sure_how_it_looks",
      sub: getAttributeFromUser(user, "sub") || undefined,
      email_verified: getAttributeFromUser(user, "email_verified") === "true",
      iss: COGNITO_IDP_DOMAIN,
      "cognito:username": user.Username,
      origin_jti: "93879f74-bbfa-4db6-8d75-e97b28e7bb5c",
      aud: USER_POOL_CLIENT_ID,
      token_use: "id",
      auth_time: authTime,
      exp: expTime,
      iat: authTime,
      jti: "aa2f38b9-5169-46f4-9982-aaa660e2fc11",
      email: getAttributeFromUser(user, "email"),
    })
      .setProtectedHeader({ alg: ALGORITHM })
      .setIssuedAt()
      .setIssuer(COGNITO_IDP_DOMAIN)
      .setAudience(USER_POOL_CLIENT_ID)
      .setExpirationTime("30m")
      .sign(await getPrivateKey());

    return jwt;
  }
  return null;
};

export const generateAccessToken = async (
  user: TestUserDataWithRole,
  authTime: number,
  expTime: number,
): Promise<string | null> => {
  if (user) {
    const jwt = await new jose.SignJWT({
      sub: getAttributeFromUser(user, "sub") || undefined,
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

    return jwt;
  }
  return null;
};

export const generateRefreshToken = async (user: TestUserDataWithRole): Promise<string | null> => {
  if (user) {
    const jwt = await new jose.SignJWT({
      sub: getAttributeFromUser(user, "sub") || undefined,
      "cognito:username": user.Username,
    })
      .setProtectedHeader({ alg: ALGORITHM })
      .setExpirationTime("30m")
      .sign(await getPrivateKey());

    return jwt;
  }
  return null;
};

export const generateSessionToken = (user: TestUserDataWithRole): string | null => {
  if (user?.Username) {
    return jose.base64url.encode(JSON.stringify({ username: user?.Username }));
  }
  return null;
};

export const getAttributeFromUser = (
  user: TestUserDataWithRole,
  attrName: string,
): string | null => {
  if (
    attrName &&
    user?.UserAttributes &&
    Array.isArray(user.UserAttributes) &&
    user.UserAttributes.length > 0
  ) {
    const attribute = user.UserAttributes.find((attr) => attr?.Name == attrName);
    return attribute?.Value || null;
  }
  return null;
};

export const getMockUsername = (): string | null => {
  if (typeof process !== "undefined" && process?.env) {
    return process.env.MOCK_USER_USERNAME || null;
  }
  // @ts-ignore ignore window being undefined because this is a check for that
  if (typeof window !== "undefined" && window?.localStorage) {
    // @ts-ignore checked that window is defined above
    return window.localStorage.getItem(
      `CognitoIdentityServiceProvider.${USER_POOL_CLIENT_ID}.LastAuthUser`,
    );
  }
  return null;
};

export const getMockUser = (): CognitoUserAttributes | null => {
  const username = getMockUsername();
  if (!username) {
    return null;
  }
  const user = getUserByUsername(username);
  if (!user) {
    return null;
  }
  return user;
};

export const getMockUserEmail = (): string | null => {
  const user = getMockUser();
  if (!user) {
    return null;
  }
  return user.email;
};

export const setMockUsername = async (
  user?: TestUserDataWithRole | string | null,
): Promise<void> => {
  let username;
  if (user && typeof user === "string") {
    username = user;
  } else if (user && (user as TestUserDataWithRole).Username !== undefined) {
    username = (user as TestUserDataWithRole).Username;
  }

  if (typeof process !== "undefined" && process?.env) {
    if (username) {
      process.env.MOCK_USER_USERNAME = username;
    } else {
      delete process.env.MOCK_USER_USERNAME;
    }
    console.log("process.env.MOCK_USER_USERNAME", username);
    // @ts-ignore ignore window being undefined because this is a check for that
  } else if (typeof window !== "undefined" && window?.localStorage?.setItem) {
    if (username) {
      // @ts-ignore checked that window is defined above
      window.localStorage.setItem(
        `CognitoIdentityServiceProvider.${USER_POOL_CLIENT_ID}.LastAuthUser`,
        username,
      );
      const user = findUserByUsername(username);
      if (user) {
        const authTime = Date.now() / 1000;
        const expTime = authTime + 1800;
        const accessToken = await generateAccessToken(user, authTime, expTime);
        const idToken = await generateIdToken(user, authTime, expTime);
        const refreshToken = await generateRefreshToken(user);

        // @ts-ignore checked that window is defined above
        window.localStorage.setItem(
          `CognitoIdentityServiceProvider.${USER_POOL_CLIENT_ID}.${username}.accessToken`,
          accessToken || "",
        );
        // @ts-ignore checked that window is defined above
        window.localStorage.setItem(
          `CognitoIdentityServiceProvider.${USER_POOL_CLIENT_ID}.${username}.clockDrift`,
          "0",
        );
        // @ts-ignore checked that window is defined above
        window.localStorage.setItem(
          `CognitoIdentityServiceProvider.${USER_POOL_CLIENT_ID}.${username}.idToken`,
          idToken || "",
        );
        // @ts-ignore checked that window is defined above
        window.localStorage.setItem(
          `CognitoIdentityServiceProvider.${USER_POOL_CLIENT_ID}.${username}.refreshToken`,
          refreshToken || "",
        );
        // @ts-ignore checked that window is defined above
        window.localStorage.setItem(
          `CognitoIdentityServiceProvider.${USER_POOL_CLIENT_ID}.${username}.userData`,
          JSON.stringify({
            UserAttributes: user.UserAttributes,
            Username: username,
          }),
        );
      }
      // @ts-ignore checked that window is defined above
      window.localStorage.setItem("amplify-redirected-from-hosted-ui", "true");
      // @ts-ignore checked that window is defined above
      window.localStorage.setItem("amplify-signin-with-hostedUI", "true");
    } else {
      // @ts-ignore checked that window is defined above
      const oldUserId = window.localStorage.getItem(
        `CognitoIdentityServiceProvider.${USER_POOL_CLIENT_ID}.LastAuthUser`,
      );
      if (oldUserId) {
        // @ts-ignore checked that window is defined above
        window.localStorage.removeItem(
          `CognitoIdentityServiceProvider.${USER_POOL_CLIENT_ID}.${oldUserId}.accessToken`,
        );
        // @ts-ignore checked that window is defined above
        window.localStorage.removeItem(
          `CognitoIdentityServiceProvider.${USER_POOL_CLIENT_ID}.${oldUserId}.clockDrift`,
        );
        // @ts-ignore checked that window is defined above
        window.localStorage.removeItem(
          `CognitoIdentityServiceProvider.${USER_POOL_CLIENT_ID}.${oldUserId}.idToken`,
        );
        // @ts-ignore checked that window is defined above
        window.localStorage.removeItem(
          `CognitoIdentityServiceProvider.${USER_POOL_CLIENT_ID}.${oldUserId}.refreshToken`,
        );
        // @ts-ignore checked that window is defined above
        window.localStorage.removeItem(
          `CognitoIdentityServiceProvider.${USER_POOL_CLIENT_ID}.${oldUserId}.userData`,
        );
        // @ts-ignore checked that window is defined above
        window.localStorage.removeItem("amplify-redirected-from-hosted-ui");
        // @ts-ignore checked that window is defined above
        window.localStorage.removeItem("amplify-signin-with-hostedUI");
      }
      // @ts-ignore checked that window is defined above
      window.localStorage.removeItem(
        `CognitoIdentityServiceProvider.${USER_POOL_CLIENT_ID}.LastAuthUser`,
      );
    }
    console.log(
      "`CognitoIdentityServiceProvider.${USER_POOL_CLIENT_ID}.LastAuthUser`",
      window.localStorage.getItem(
        `CognitoIdentityServiceProvider.${USER_POOL_CLIENT_ID}.LastAuthUser`,
      ),
    );
  }
};

export const setDefaultStateSubmitter = async () => setMockUsername(testStateSubmitter);

export const setDefaultReviewer = async () => setMockUsername(testReviewer);

export const findUserByUsername = (username: string): TestUserDataWithRole | undefined =>
  userResponses.find((user) => user.Username == username);

export const convertUserAttributes = (user: TestUserDataWithRole): FullUser => {
  if (user?.UserAttributes) {
    const userAttributesObj = user.UserAttributes.reduce(
      (obj, item) =>
        item?.Name && item?.Value
          ? {
              ...obj,
              [item.Name]: item.Value,
            }
          : obj,
      {} as FullUser,
    );
    // Manual additions and normalizations
    userAttributesObj["custom:cms-roles"] = userAttributesObj["custom:cms-roles"] || "";

    userAttributesObj.username = user.Username || "";

    return { ...userAttributesObj, role: user.role, states: user.states };
  }

  return {} as FullUser;
};
