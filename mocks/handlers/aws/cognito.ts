import jwt from "jsonwebtoken";
import { http, HttpResponse, passthrough, PathParams } from "msw";
import {
  ACCESS_KEY_ID,
  IDENTITY_POOL_ID,
  SECRET_KEY,
  USER_POOL_CLIENT_ID,
  COGNITO_IDP_DOMAIN,
} from "../../consts";
import type {
  IdentityRequest,
  IdpListUsersRequestBody,
  IdpRefreshRequestBody,
  IdpRequestSessionBody,
  AdminGetUserRequestBody,
  TestUserData,
} from "../../index.d";
import { findUserByUsername } from "../authUtils";
import { APIGatewayEventRequestContext } from "shared-types";
import { userResponses } from "../../data/users";

const getUsernameFromAccessToken = (accessToken?: string): string | undefined => {
  if (accessToken) {
    return jwt.decode(accessToken, { json: true })?.get("username");
  }
  return undefined;
};

const generateIdToken = (user: TestUserData, authTime: number, expTime: number): string | null => {
  if (user) {
    return jwt.sign(
      {
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
      },
      SECRET_KEY,
      {
        algorithm: "RS256",
        expiresIn: "30m",
        audience: USER_POOL_CLIENT_ID,
        issuer: COGNITO_IDP_DOMAIN,
      },
    );
  }
  return null;
};

const generateAccessToken = (
  user: TestUserData,
  authTime: number,
  expTime: number,
): string | null => {
  if (user) {
    return jwt.sign(
      {
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
      },
      SECRET_KEY,
      {
        algorithm: "RS256",
        expiresIn: "30m",
        audience: USER_POOL_CLIENT_ID,
        issuer: COGNITO_IDP_DOMAIN,
      },
    );
  }
  return null;
};

const generateRefreshToken = (user: TestUserData): string | null => {
  if (user) {
    return jwt.sign(
      {
        sub: getAttributeFromUser(user, "sub"),
        "cognito:username": user.Username,
      },
      SECRET_KEY,
      {
        expiresIn: "30m",
      },
    );
  }
  return null;
};

const generateSessionToken = (user: TestUserData): string | null => {
  if (user?.Username) {
    return Buffer.from(JSON.stringify({ username: user?.Username })).toString("base64");
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
  } else if (process.env.MOCK_USER_USERNAME) {
    username = process.env.MOCK_USER_USERNAME;
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
  if (process.env.MOCK_USER_USERNAME) {
    const user = findUserByUsername(process.env.MOCK_USER_USERNAME);
    if (user) {
      const authTime = Date.now() / 1000;
      const expTime = authTime + 1800;
      return HttpResponse.json({
        id_token: generateIdToken(user, authTime, expTime),
        access_token: generateAccessToken(user, authTime, expTime),
        refresh_token: generateRefreshToken(user),
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
          const payload = jwt.decode(Logins.value);
          if (payload && typeof payload !== "string") {
            username = payload["cognito:username"].toString();
          }
        }
        if (!username) {
          username = process.env.MOCK_USER_USERNAME;
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
        const payload = jwt.decode(AuthParameters.REFRESH_TOKEN);
        let username;
        if (payload && typeof payload !== "string") {
          username = payload["cognito:username"].toString();
        }
        if (!username) {
          username = process.env.MOCK_USER_USERNAME;
        }

        if (username) {
          const user = findUserByUsername(username);
          if (user) {
            const authTime = Date.now() / 1000;
            const expTime = authTime + 1800;
            return HttpResponse.json({
              AuthenticationResult: {
                AccessToken: generateAccessToken(user, authTime, expTime),
                ExpiresIn: 1800,
                IdToken: generateIdToken(user, authTime, expTime),
                NewDeviceMetadata: {
                  DeviceGroupKey: "string3",
                  DeviceKey: "string4",
                },
                RefreshToken: generateRefreshToken(user),
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
      const username = getUsernameFromAccessToken(AccessToken) || process.env.MOCK_USER_USERNAME;

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
      const username = Username || process.env.MOCK_USER_USERNAME;

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

export const cognitoHandlers = [
  signInHandler,
  identityProviderServiceHandler,
  identityServiceHandler,
];
