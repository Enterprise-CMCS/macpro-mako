import { CognitoUserAttribute } from "amazon-cognito-identity-js";
import jwt from "jsonwebtoken";
import { http, HttpResponse, passthrough, PathParams } from "msw";
import { APIGatewayEventRequestContext, CognitoUserAttributes } from "shared-types";
import { isCmsUser } from "shared-utils";
import {
  ACCESS_KEY_ID,
  COGNITO_IDP_DOMAIN,
  IDENTITY_POOL_ID,
  SECRET_KEY,
  USER_POOL_CLIENT_ID,
} from "../consts";
import { makoReviewer, makoStateSubmitter, userResponses } from "../data/users";
import type {
  IdpListUsersRequestBody,
  IdpRefreshRequestBody,
  IdpRequestSessionBody,
  TestUserData,
} from "../index.d";

export const setMockUsername = (user?: TestUserData | string | null): void => {
  if (user && typeof user === "string") {
    process.env.MOCK_USER_USERNAME = user;
  } else if (user && (user as TestUserData).Username !== undefined) {
    process.env.MOCK_USER_USERNAME = (user as TestUserData).Username;
  } else {
    delete process.env.MOCK_USER_USERNAME;
  }
};

export const setDefaultStateSubmitter = () => setMockUsername(makoStateSubmitter);

export const setDefaultReviewer = () => setMockUsername(makoReviewer);

// using any here because the function that this is mocking uses any
export const mockCurrentAuthenticatedUser = (): TestUserData | any => {
  if (process.env.MOCK_USER_USERNAME) {
    return findUserByUsername(process.env.MOCK_USER_USERNAME);
  }
  return undefined;
};

// using any here because the function that this is mocking uses any
export const mockUserAttributes = async (user: any): Promise<CognitoUserAttribute[]> => {
  if (user && (user as TestUserData).UserAttributes !== undefined) {
    return (user as TestUserData).UserAttributes as CognitoUserAttribute[];
  }

  if (process.env.MOCK_USER_USERNAME) {
    const defaultUser = findUserByUsername(process.env.MOCK_USER_USERNAME);
    return defaultUser?.UserAttributes as CognitoUserAttribute[];
  }
  return {} as CognitoUserAttribute[];
};

export const convertUserAttributes = (user: TestUserData): CognitoUserAttributes => {
  if (user?.UserAttributes) {
    const userAttributesObj = user.UserAttributes.reduce(
      (obj, item) =>
        item?.Name && item?.Value
          ? {
              ...obj,
              [item.Name]: item.Value,
            }
          : obj,
      {} as CognitoUserAttributes,
    );
    // Manual additions and normalizations
    userAttributesObj["custom:cms-roles"] = userAttributesObj["custom:cms-roles"] || "";

    userAttributesObj.username = user.Username || "";

    return userAttributesObj;
  }

  return {} as CognitoUserAttributes;
};

export const mockUseGetUser = () => {
  if (process.env.MOCK_USER_USERNAME) {
    const user = findUserByUsername(process.env.MOCK_USER_USERNAME);
    if (user) {
      // Copied from useGetUser.getUser
      // Set object up with key/values from attributes array
      const userAttributesObj = convertUserAttributes(user);

      return {
        data: {
          user: userAttributesObj,
          isCms: isCmsUser(userAttributesObj),
        },
        isLoading: false,
        isSuccess: true,
      };
    }
  }
  return {
    data: null,
    isLoading: false,
    isSuccess: true,
  };
};

const findUserByUsername = (username: string): TestUserData | undefined =>
  userResponses.find((user) => user.Username == username);

const getUsernameFromAccessToken = (accessToken?: string): string | undefined => {
  if (accessToken) {
    return jwt.decode(accessToken, { json: true })?.get("username");
  }
  return undefined;
};

// const getUsernameFromSessionToken = (sessionToken?: string | null): string | undefined => {
//   if (sessionToken) {
//     const session = JSON.parse(Buffer.from(sessionToken, "base64").toString());
//     return session?.username;
//   }
//   return undefined;
// };

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

export const signInHandler = http.post(/amazoncognito.com\/oauth2\/token/, async () => {
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
  IdpRequestSessionBody | IdpRefreshRequestBody | IdpListUsersRequestBody
>(/https:\/\/cognito-idp.\S*.amazonaws.com\//, async ({ request }) => {
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

    if (target == "AWSCognitoIdentityProviderService.ListUsers") {
      const { Filter } = (await request.json()) as IdpListUsersRequestBody;
      const username =
        Filter.replace("sub = ", "").replaceAll('"', "") || process.env.MOCK_USER_USERNAME;

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
      return HttpResponse.json({
        Users: [],
      });
    }

    console.error(`x-amz-target ${target} not mocked`);
    return passthrough();
  }

  console.error("x-amz-target not present");
  return passthrough();
});

export type IdentityRequest = {
  IdentityPoolId: string;
  Logins: Record<string, string>;
};

export const defaultHandlers = [
  signInHandler,
  identityProviderServiceHandler,
  identityServiceHandler,
];
