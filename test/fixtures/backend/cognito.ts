import { http, HttpResponse, type PathParams } from "msw";

import {
  ACCESS_KEY_ID,
  COGNITO_IDP_DOMAIN,
  IDENTITY_POOL_ID,
  SECRET_KEY,
} from "../../../mocks/consts";
import {
  findMockUser,
  generateAccessToken,
  generateIdToken,
  generateRefreshToken,
  getAttribute,
} from "../../lib/cognito-tokens";

function currentUsername(): string | undefined {
  return process.env.MOCK_USER_USERNAME || undefined;
}

export const e2eCognitoHandlers = [
  http.get(/amazoncognito\.com\/oauth2\/authorize/, ({ request }) => {
    const url = new URL(request.url);
    const redirectUri = url.searchParams.get("redirect_uri") || "http://localhost:5000/dashboard";
    const state = url.searchParams.get("state");
    const redirect = new URL(redirectUri);
    redirect.searchParams.set("code", "e2e-mock-code");
    if (state) redirect.searchParams.set("state", state);
    return HttpResponse.redirect(redirect.toString(), 302);
  }),

  http.get(/amazoncognito\.com\/logout/, ({ request }) => {
    const url = new URL(request.url);
    const logoutUri = url.searchParams.get("logout_uri") || "http://localhost:5000/";
    return HttpResponse.redirect(logoutUri, 302);
  }),

  http.post(/amazoncognito\.com\/oauth2\/token/, async () => {
    const username = currentUsername();
    if (!username) {
      return new HttpResponse("User not set", { status: 401 });
    }
    const user = findMockUser(username);
    if (!user) {
      return new HttpResponse("No user found with this sub", { status: 404 });
    }
    const authTime = Date.now() / 1000;
    const expTime = authTime + 1800;
    return HttpResponse.json({
      id_token: await generateIdToken(user, authTime, expTime),
      access_token: await generateAccessToken(user, authTime, expTime),
      refresh_token: await generateRefreshToken(user),
      expires_in: 1800,
      token_type: "Bearer",
    });
  }),

  http.post(/cognito-identity/, async ({ request }) => {
    const target = request.headers.get("x-amz-target");
    if (target === "AWSCognitoIdentityService.GetId") {
      return HttpResponse.json({ IdentityId: IDENTITY_POOL_ID });
    }
    if (target === "AWSCognitoIdentityService.GetCredentialsForIdentity") {
      const username = currentUsername();
      const user = username ? findMockUser(username) : undefined;
      if (!user) {
        return new HttpResponse("User not set", { status: 401 });
      }
      return HttpResponse.json({
        Credentials: {
          AccessKeyId: ACCESS_KEY_ID,
          // Match mocks/handlers/aws/cognito.ts — Amplify refreshes often but stays usable.
          Expiration: 1.73,
          SecretKey: SECRET_KEY,
          SessionToken: joseBase64({ username: user.Username }),
        },
        IdentityId: IDENTITY_POOL_ID,
      });
    }
    return new HttpResponse(`Unhandled cognito-identity target ${target}`, { status: 500 });
  }),

  // Amplify posts to cognito-idp with or without a trailing slash.
  http.post<PathParams, any>(
    /https:\/\/cognito-idp\.[^/]*\.amazonaws\.com\/?/,
    async ({ request }) => {
      const target = request.headers.get("x-amz-target");
      const username = currentUsername();
      const user = username ? findMockUser(username) : undefined;

      if (target === "AWSCognitoIdentityProviderService.GetUser") {
        if (!user) return new HttpResponse("User not set", { status: 401 });
        return HttpResponse.json({
          Username: user.Username,
          UserAttributes: user.UserAttributes,
        });
      }

      if (target === "AWSCognitoIdentityProviderService.InitiateAuth") {
        if (!user) return new HttpResponse("User not set", { status: 401 });
        const authTime = Date.now() / 1000;
        const expTime = authTime + 1800;
        return HttpResponse.json({
          AuthenticationResult: {
            AccessToken: await generateAccessToken(user, authTime, expTime),
            IdToken: await generateIdToken(user, authTime, expTime),
            RefreshToken: await generateRefreshToken(user),
            ExpiresIn: 1800,
            TokenType: "Bearer",
          },
        });
      }

      if (target === "AWSCognitoIdentityProviderService.GlobalSignOut") {
        return HttpResponse.json({});
      }

      if (target === "AWSCognitoIdentityProviderService.AdminGetUser") {
        const body = (await request.json()) as { Username?: string };
        const found = body.Username ? findMockUser(body.Username) : user;
        if (!found) return new HttpResponse("User not found", { status: 404 });
        return HttpResponse.json({
          Username: found.Username,
          UserAttributes: found.UserAttributes,
          UserStatus: "CONFIRMED",
          Enabled: true,
        });
      }

      // Keep Amplify happy for unhandled IDP calls during mocked e2e.
      return HttpResponse.json({});
    },
  ),
];

function joseBase64(value: object): string {
  return Buffer.from(JSON.stringify(value)).toString("base64url");
}

export { COGNITO_IDP_DOMAIN, getAttribute };
