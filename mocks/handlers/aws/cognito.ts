import * as jose from "jose";
import { http, HttpResponse, passthrough, PathParams } from "msw";
import { APIGatewayEventRequestContext } from "shared-types";

import {
  ACCESS_KEY_ID,
  COGNITO_IDP_DOMAIN,
  IDENTITY_POOL_ID,
  PUBLIC_KEY,
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
import {
  findUserByUsername,
  generateAccessToken,
  generateIdToken,
  generateRefreshToken,
  generateSessionToken,
  getMockUsername,
  getUsernameFromAccessToken,
} from "../auth.utils";

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

// https://compliance-breadcrumbs-login-4e1pcu4tsvjk6r16v67f2hd1vc.auth.us-east-1.amazoncognito.com/oauth2/token
// https://compliance-breadcrumbs-login-4e1pcu4tsvjk6r16v67f2hd1vc.auth.us-east-1.amazoncognito.com/login

// https://https://mocked-tests-login-userpoolwebclientid.auth.us-east-1.amazoncognito.com/oauth2/authorize?redirect_uri=http://localhost:5000/&response_type=code&client_id=userPoolWebClientId
//GET Status Code 302 Found

export const amplifyHandler = http.get(
  "http://localhost:5000/node_modules/.vite/deps/aws-amplify.js",
  ({ request }) => {
    console.log("amplifyHandler", { request, headers: request.headers });
  },
);

export const authorizeHandler = http.get(
  /amazoncognito\.com\/oauth2\/authorize/,
  async ({ request }) => {
    console.log("authorizeHandler", { request, headers: request.headers });
    const url = new URL(request.url);

    const redirectUri = url.searchParams.get("redirect_uri");
    const responseType = url.searchParams.get("response_type");
    const clientId = url.searchParams.get("client_id");

    return new HttpResponse(null, {
      status: 302,
      headers: {
        location: `https://mocked-tests-login-userpoolwebclientid.auth.us-east-1.amazoncognito.com/login?redirect_url=${redirectUri}&response_type=${responseType}&client_id=${clientId}`,
        "set-cookie": `
          XSRF-TOKEN=552623cf-ff5f-4118-bccf-0449ba8704b1; Path=/; Secure; HttpOnly; SameSite=Lax
          csrf-state=""; Expires=Tue, 17-Jun-2025 20:37:56 GMT; Path=/; Secure; HttpOnly; SameSite=None
          csrf-state-legacy=""; Expires=Tue, 17-Jun-2025 20:37:56 GMT; Path=/; Secure; HttpOnly
        `,
      },
    });
  },
);

export const loginGetHandler = http.get(
  /amazoncognito\.com\/login/,
  async () => new HttpResponse(null, { status: 200 }),
);

export const loginPostHandler = http.post(/amazoncognito\.com\/login/, async ({ request }) => {
  console.log("loginPostHandler", { request, headers: request.headers });
  const url = new URL(request.url);

  const redirectUri = url.searchParams.get("redirect_uri");

  return new HttpResponse(null, {
    status: 302,
    headers: {
      location: redirectUri || "http://localhost:5000",
    },
  });
});

export const tokenHandler = http.post(/amazoncognito\.com\/oauth2\/token/, async ({ request }) => {
  console.log("tokenHandler", { request, headers: request.headers });
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
        const responseString = JSON.stringify({ IdentityId: IDENTITY_POOL_ID });

        return new HttpResponse(responseString, {
          headers: {
            "Content-Length": btoa(responseString).length.toString(),
            "Access-Control-Allow-Origin": "*",
            "Content-Type": "application/x-amz-json-1.1",
            "Content-Encoding": "base64",
            Date: new Date().toUTCString(),
          },
        });
      }

      if (target == "AWSCognitoIdentityService.GetCredentialsForIdentity") {
        let username;
        const { Logins } = await request.json();
        if (Logins?.value) {
          console.log("AWSCognitoIdentityService.GetCredentialsForIdentity");
          const { payload } = await jose.jwtVerify(Logins.value, PUBLIC_KEY, {
            issuer: COGNITO_IDP_DOMAIN,
            audience: USER_POOL_CLIENT_ID,
          });
          if (payload && typeof payload !== "string") {
            username = `${payload["cognito:username"]}`;
          }
        }
        if (!username) {
          username = getMockUsername();
        }

        if (username) {
          const user = findUserByUsername(username);

          if (user) {
            const responseString = JSON.stringify({
              Credentials: {
                AccessKeyId: ACCESS_KEY_ID,
                Expiration: 1.73,
                SecretKey: SECRET_KEY,
                SessionToken: generateSessionToken(user),
              },
              IdentityId: IDENTITY_POOL_ID,
            });

            return new HttpResponse(responseString, {
              headers: {
                "Content-Length": btoa(responseString).length.toString(),
                "Access-Control-Allow-Origin": "*",
                "Content-Type": "application/x-amz-json-1.1",
                "Content-Encoding": "base64",
                Date: new Date().toUTCString(),
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
>(/https:\/\/cognito-idp\.\S*.amazonaws\.com\//, async ({ request }) => {
  console.log("identityProviderServiceHandler", { request, headers: request.headers });
  const target = request.headers.get("x-amz-target");
  console.log({ target });
  if (target) {
    if (target == "AWSCognitoIdentityProviderService.InitiateAuth") {
      const { AuthFlow, AuthParameters } = (await request.json()) as IdpRefreshRequestBody;
      if (AuthFlow === "REFRESH_TOKEN_AUTH" && AuthParameters?.REFRESH_TOKEN) {
        console.log("AWSCognitoIdentityProviderService.InitiateAuth");
        const { payload } = await jose.jwtVerify(AuthParameters.REFRESH_TOKEN, PUBLIC_KEY, {
          issuer: COGNITO_IDP_DOMAIN,
          audience: USER_POOL_CLIENT_ID,
        });
        let username;
        if (payload && typeof payload !== "string") {
          username = `${payload["cognito:username"]}`;
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
      console.log("AWSCognitoIdentityProviderService.GetUser", { username });

      // const agent = request.headers.get("x-amz-user-agent");

      // if (agent == "aws-amplify/5.0.4 auth framework/0") {
      // called by Auth.currentAuthenticatedUser

      // } else if (agent == "aws-amplify/5.0.4 auth framework/1") {
      // called by Auth.userAttributes

      if (username) {
        const user = findUserByUsername(username);

        if (user) {
          const responseString = JSON.stringify(user);

          return new HttpResponse(responseString, {
            headers: {
              "Content-Length": btoa(responseString).length.toString(),
              "Access-Control-Allow-Origin": "*",
              "Content-Type": "application/x-amz-json-1.1",
              "Content-Encoding": "base64",
              Date: new Date().toUTCString(),
            },
            status: 200,
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
>(/https:\/\/cognito-idp\.\S*.amazonaws\.com\//, async ({ request }) => {
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
  /https:\/\/cognito-idp\.\S*.amazonaws\.com\//,
  async () => new HttpResponse("Response Error", { status: 500 }),
);

export const cognitoHandlers = [
  authorizeHandler,
  loginGetHandler,
  loginPostHandler,
  tokenHandler,
  identityProviderServiceHandler,
  identityServiceHandler,
];
