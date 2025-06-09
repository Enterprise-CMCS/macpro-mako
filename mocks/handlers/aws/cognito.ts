import * as jose from "jose";
import { http, HttpResponse, passthrough, PathParams } from "msw";
import { APIGatewayEventRequestContext } from "shared-types";

import {
  ACCESS_KEY_ID,
  COGNITO_IDP_DOMAIN,
  IDENTITY_POOL_ID,
  SECRET_KEY,
  USER_POOL_CLIENT_ID,
} from "../../consts";
import { userResponses } from "../../data/users";
import type {
  AdminGetUserRequestBody,
  IdentityRequest,
  IdpListUsersRequestBody,
  IdpRefreshRequestBody,
  IdpRequestSessionBody,
  TestUserData,
} from "../../index.d";
import { findUserByUsername, getMockUsername } from "../auth.utils";

const secret = new TextEncoder().encode(SECRET_KEY);
const alg = "RS256";

const getUsernameFromAccessToken = async (accessToken?: string): Promise<string | undefined> => {
  if (accessToken) {
    const { payload } = await jose.jwtVerify(accessToken, secret, {
      issuer: COGNITO_IDP_DOMAIN,
      audience: USER_POOL_CLIENT_ID,
    });

    console.log("getUsernameFromAccessToken");
    return payload.username as string;
  }
  return undefined;
};

const generateIdToken = async (
  user: TestUserData,
  authTime: number,
  expTime: number,
): Promise<string | null> => {
  if (user) {
    const jwt = await new jose.SignJWT({
      sub: getAttributeFromUser(user, "sub"),
      email_verified: getAttributeFromUser(user, "email_verified") === "true",
      iss: COGNITO_IDP_DOMAIN,
      "cognito:username": user.Username,
      aud: USER_POOL_CLIENT_ID,
      token_use: "id",
      auth_time: authTime,
      exp: expTime,
      iat: authTime,
      email: getAttributeFromUser(user, "email"),
    })
      .setProtectedHeader({ alg })
      .setIssuedAt()
      .setIssuer(COGNITO_IDP_DOMAIN)
      .setAudience(USER_POOL_CLIENT_ID)
      .setExpirationTime("30m")
      .sign(secret);

    return jwt;
  }
  return null;
};

const generateAccessToken = async (
  user: TestUserData,
  authTime: number,
  expTime: number,
): Promise<string | null> => {
  if (user) {
    const jwt = await new jose.SignJWT({
      sub: getAttributeFromUser(user, "sub"),
      iss: COGNITO_IDP_DOMAIN,
      version: 2,
      client_id: USER_POOL_CLIENT_ID,
      token_use: "access",
      scope: "aws.cognito.signin.user.admin openid email",
      auth_time: authTime,
      exp: expTime,
      iat: authTime,
      username: user.Username,
    })
      .setProtectedHeader({ alg })
      .setIssuedAt()
      .setIssuer(COGNITO_IDP_DOMAIN)
      .setAudience(USER_POOL_CLIENT_ID)
      .setExpirationTime("30m")
      .sign(secret);

    return jwt;
  }
  return null;
};

const generateRefreshToken = async (user: TestUserData): Promise<string | null> => {
  if (user) {
    const jwt = await new jose.SignJWT({
      sub: getAttributeFromUser(user, "sub"),
      "cognito:username": user.Username,
    })
      .setExpirationTime("30m")
      .sign(secret);

    return jwt;
  }
  return null;
};

const generateSessionToken = (user: TestUserData): string | null => {
  if (user?.Username) {
    return jose.base64url.encode(JSON.stringify({ username: user?.Username }));
  }
  return null;
};

const getAttributeFromUser = (user: TestUserData, attrName: string): string | null => {
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

export const getRequestContext = (user?: TestUserData | string): APIGatewayEventRequestContext => {
  let username;
  if (user && typeof user === "string") {
    username = user;
  } else if (user && (user as TestUserData).Username !== undefined) {
    username = (user as TestUserData).Username;
  } else {
    username = getMockUsername();
  }

  if (username) {
    return {
      identity: {
        cognitoAuthenticationProvider: `${COGNITO_IDP_DOMAIN},${COGNITO_IDP_DOMAIN}:CognitoSignIn:${username}`,
      },
    } as APIGatewayEventRequestContext;
  }
  return {
    identity: {},
  } as APIGatewayEventRequestContext;
};

export const signInHandler = http.post(/amazoncognito.com\/oauth2\/token/, async ({ request }) => {
  console.log("signInHandler", { request, headers: request.headers });
  const username = getMockUsername();

  if (username) {
    const user = findUserByUsername(username);
    if (user) {
      const authTime = Date.now() / 1000;
      const expTime = authTime + 1800;
      return HttpResponse.json({
        id_token: await generateIdToken(user, authTime, expTime),
        access_token: await generateAccessToken(user, authTime, expTime),
        refresh_token: await generateRefreshToken(user),
        expires_in: 1800,
        token_type: "Bearer",
      });
    }
    return new HttpResponse("No user found with this sub", { status: 404 });
  }
  return new HttpResponse("User not set", { status: 401 });
});

export const identityServiceHandler = http.post<PathParams, IdentityRequest>(
  /cognito-identity/,
  async ({ request }) => {
    console.log("identityServiceHandler", { request, headers: request.headers });
    const target = request.headers.get("x-amz-target");
    if (target) {
      if (target == "AWSCognitoIdentityService.GetId") {
        const responseBuffer = Buffer.from(JSON.stringify({ IdentityId: IDENTITY_POOL_ID }));
        const responseEncoded = responseBuffer.toString("base64");

        return new HttpResponse(responseEncoded, {
          headers: {
            "Content-Type": "application/x-amz-json-1.1",
            "Content-Encoding": "base64",
            "Content-Length": responseBuffer.byteLength.toString(),
          },
        });
      }

      if (target == "AWSCognitoIdentityService.GetCredentialsForIdentity") {
        let username;
        const { Logins } = await request.json();
        if (Logins?.value) {
          console.log("AWSCognitoIdentityService.GetCredentialsForIdentity");
          const { payload } = await jose.jwtVerify(Logins.value, secret, {
            issuer: COGNITO_IDP_DOMAIN,
            audience: USER_POOL_CLIENT_ID,
          });
          if (payload && typeof payload !== "string") {
            username = payload["cognito:username"].toString();
          }
        }
        if (!username) {
          username = getMockUsername();
        }

        if (username) {
          const user = findUserByUsername(username);

          if (user) {
            const responseBuffer = Buffer.from(
              JSON.stringify({
                Credentials: {
                  AccessKeyId: ACCESS_KEY_ID,
                  Expiration: 1.73,
                  SecretKey: SECRET_KEY,
                  SessionToken: generateSessionToken(user),
                },
                IdentityId: IDENTITY_POOL_ID,
              }),
            );

            const responseEncoded = responseBuffer.toString("base64");

            return new HttpResponse(responseEncoded, {
              headers: {
                "Content-Type": "application/x-amz-json-1.1",
                "Content-Encoding": "base64",
                "Content-Length": responseBuffer.byteLength.toString(),
              },
            });
          }

          return new HttpResponse("No user found with this sub", { status: 404 });
        }
        return new HttpResponse("User not set", { status: 401 });
      }
      console.error(`x-amz-target ${target} not mocked`);
      return passthrough();
    }
    console.error("x-amz-target not present");
    return passthrough();
  },
);

export const identityProviderServiceHandler = http.post<
  PathParams,
  IdpRequestSessionBody | IdpRefreshRequestBody | IdpListUsersRequestBody | AdminGetUserRequestBody
>(/https:\/\/cognito-idp.\S*.amazonaws.com\//, async ({ request }) => {
  console.log("identityProviderServiceHandler", { request, headers: request.headers });
  const target = request.headers.get("x-amz-target");
  if (target) {
    if (target == "AWSCognitoIdentityProviderService.InitiateAuth") {
      const { AuthFlow, AuthParameters } = (await request.json()) as IdpRefreshRequestBody;
      if (AuthFlow === "REFRESH_TOKEN_AUTH" && AuthParameters?.REFRESH_TOKEN) {
        console.log("AWSCognitoIdentityProviderService.InitiateAuth");
        const { payload } = await jose.jwtVerify(AuthParameters.REFRESH_TOKEN, secret, {
          issuer: COGNITO_IDP_DOMAIN,
          audience: USER_POOL_CLIENT_ID,
        });
        let username;
        if (payload && typeof payload !== "string") {
          username = payload["cognito:username"].toString();
        }
        if (!username) {
          username = getMockUsername();
        }

        if (username) {
          const user = findUserByUsername(username);
          if (user) {
            const authTime = Date.now() / 1000;
            const expTime = authTime + 1800;
            return HttpResponse.json({
              AuthenticationResult: {
                AccessToken: await generateAccessToken(user, authTime, expTime),
                ExpiresIn: 1800,
                IdToken: await generateIdToken(user, authTime, expTime),
                NewDeviceMetadata: {
                  DeviceGroupKey: "string3",
                  DeviceKey: "string4",
                },
                RefreshToken: await generateRefreshToken(user),
                TokenType: "Bearer",
              },
              AvailableChallenges: ["string7"],
              ChallengeName: "string8",
              ChallengeParameters: {
                string: "string9",
              },
              Session: generateSessionToken(user),
            });
          }
          return new HttpResponse("No user found with this sub", { status: 404 });
        }
        return new HttpResponse("User not set", { status: 401 });
      }
      console.error(
        `Authflow ${AuthFlow} or AuthParameters ${JSON.stringify(AuthParameters)} not supported`,
      );
      return passthrough();
    }
    if (target == "AWSCognitoIdentityProviderService.AdminUpdateUserAttributes") {
      return new HttpResponse(null, { status: 200 });
    }
    if (target == "AWSCognitoIdentityProviderService.GetUser") {
      const { AccessToken } = (await request.json()) as IdpRequestSessionBody;
      const username = (await getUsernameFromAccessToken(AccessToken)) || getMockUsername();

      // const agent = request.headers.get("x-amz-user-agent");

      // if (agent == "aws-amplify/5.0.4 auth framework/0") {
      // called by Auth.currentAuthenticatedUser

      // } else if (agent == "aws-amplify/5.0.4 auth framework/1") {
      // called by Auth.userAttributes

      if (username) {
        const user = findUserByUsername(username);
        if (user) {
          const encodedUser = Buffer.from(JSON.stringify(user)).toString("base64");

          return new HttpResponse(encodedUser, {
            headers: {
              "Content-Type": "application/x-amz-json-1.1",
              "Content-Encoding": "base64",
            },
          });
        }
        return new HttpResponse("No user found with this sub", { status: 404 });
      }
      return new HttpResponse("User not set", { status: 401 });
    }

    if (target == "AWSCognitoIdentityProviderService.AdminCreateUser") {
      return new HttpResponse(null, { status: 200 });
    }

    if (target == "AWSCognitoIdentityProviderService.AdminSetUserPassword") {
      return new HttpResponse(null, { status: 200 });
    }

    if (target == "AWSCognitoIdentityProviderService.AdminGetUser") {
      const { Username } = (await request.json()) as AdminGetUserRequestBody;
      const username = Username || getMockUsername();

      if (username) {
        const user = findUserByUsername(username);
        if (user) {
          return HttpResponse.json(user);
        }
        return new HttpResponse("No user found with this sub", { status: 404 });
      }
      return new HttpResponse("User not set", { status: 401 });
    }

    if (target == "AWSCognitoIdentityProviderService.ListUsers") {
      const { Filter } = (await request.json()) as IdpListUsersRequestBody;

      if (Filter && Filter.startsWith("sub = ")) {
        const username = Filter.replace("sub = ", "").replaceAll('"', "");
        if (username) {
          const user = findUserByUsername(username);
          if (user) {
            return HttpResponse.json({
              Users: [
                {
                  Attributes: user.UserAttributes,
                  Username: user.Username,
                  UserStatus: "CONFIRMED",
                  Enabled: true,
                },
              ],
            });
          }
        }
      }

      return HttpResponse.json({
        Users: userResponses.map((user) => ({
          Attributes: user.UserAttributes,
          Username: user.Username,
          UserStatus: "CONFIRMED",
          Enabled: true,
        })),
      });
    }

    console.log(`x-amz-target ${target} not mocked`);
    return passthrough();
  }

  console.error("x-amz-target not present");
  return passthrough();
});

export const emptyIdentityProviderServiceHandler = http.post<
  PathParams,
  IdpRequestSessionBody | IdpRefreshRequestBody | IdpListUsersRequestBody | AdminGetUserRequestBody
>(/https:\/\/cognito-idp.\S*.amazonaws.com\//, async ({ request }) => {
  const target = request.headers.get("x-amz-target");
  if (target == "AWSCognitoIdentityProviderService.ListUsers") {
    const { Filter } = (await request.json()) as IdpListUsersRequestBody;

    if (Filter && Filter.startsWith("sub = ")) {
      const username = Filter.replace("sub = ", "").replaceAll('"', "");
      if (username) {
        const user = findUserByUsername(username);
        if (user) {
          return HttpResponse.json({
            Users: [
              {
                Attributes: user.UserAttributes,
                Username: user.Username,
                UserStatus: "CONFIRMED",
                Enabled: true,
              },
            ],
          });
        }
      }
    }
    return HttpResponse.json({
      Users: [],
    });
  }

  console.error("x-amz-target not present");
  return passthrough();
});

export const errorIdentityProviderServiceHandler = http.post<
  PathParams,
  IdpRequestSessionBody | IdpRefreshRequestBody | IdpListUsersRequestBody | AdminGetUserRequestBody
>(
  /https:\/\/cognito-idp.\S*.amazonaws.com\//,
  async () => new HttpResponse("Response Error", { status: 500 }),
);

export const cognitoHandlers = [
  signInHandler,
  identityProviderServiceHandler,
  identityServiceHandler,
];
