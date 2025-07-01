import middy, { Request } from "@middy/core";
import httpErrorHandler from "@middy/http-error-handler";
import { APIGatewayEvent, APIGatewayEventRequestContext, Context } from "aws-lambda";
import {
  CO_STATE_SUBMITTER_USERNAME,
  COGNITO_IDP_DOMAIN,
  getFilteredRoleDocsByEmail,
  getRequestContext,
  NO_EMAIL_STATE_SUBMITTER_USERNAME,
  osUsers,
  setMockUsername,
  TEST_REVIEWER_USERNAME,
  TEST_STATE_SUBMITTER_EMAIL,
  TEST_STATE_SUBMITTER_USER,
  TEST_STATE_SUBMITTER_USERNAME,
} from "mocks";
import { roles } from "shared-types/opensearch";
import { describe, expect, it } from "vitest";

import { isAuthenticated } from "./isAuthenticated";
import { getUser, MiddyUser } from "./utils";

describe("isAuthenticated", () => {
  it("should return 401, if there is no request context", async () => {
    const event = {
      body: "test",
    } as APIGatewayEvent;

    const handler = middy().use(httpErrorHandler()).use(isAuthenticated());

    const res = await handler(event, {} as Context);

    expect(res).toBeTruthy();
    expect(res.statusCode).toEqual(401);
    expect(res.body).toEqual(JSON.stringify({ message: "User is not authenticated" }));
  });

  it("should return 401, if there is no user", async () => {
    setMockUsername(null);

    const event = {
      body: "test",
      requestContext: getRequestContext(),
    } as APIGatewayEvent;

    const handler = middy().use(httpErrorHandler()).use(isAuthenticated());

    const res = await handler(event, {} as Context);

    expect(res).toBeTruthy();
    expect(res.statusCode).toEqual(401);
    expect(res.body).toEqual(JSON.stringify({ message: "User is not authenticated" }));
  });

  it("should return 401, if there is no pool id", async () => {
    const missingPoolIdDomain = "https://cognito-idp.us-east-1.amazonaws.com/";
    const event = {
      body: "test",
      requestContext: {
        identity: {
          cognitoAuthenticationProvider: `${missingPoolIdDomain},${missingPoolIdDomain}:CognitoSignIn:${TEST_STATE_SUBMITTER_USERNAME}`,
        },
      } as APIGatewayEventRequestContext,
    } as APIGatewayEvent;

    const handler = middy().use(httpErrorHandler()).use(isAuthenticated());

    const res = await handler(event, {} as Context);

    expect(res).toBeTruthy();
    expect(res.statusCode).toEqual(401);
    expect(res.body).toEqual(JSON.stringify({ message: "User is not authenticated" }));
  });

  it("should return 401, if there is no user id", async () => {
    setMockUsername(null);

    const event = {
      body: "test",
      requestContext: {
        identity: {
          cognitoAuthenticationProvider: `${COGNITO_IDP_DOMAIN},${COGNITO_IDP_DOMAIN}:CognitoSignIn:`,
        },
      } as APIGatewayEventRequestContext,
    } as APIGatewayEvent;

    const handler = middy().use(httpErrorHandler()).use(isAuthenticated());

    const res = await handler(event, {} as Context);

    expect(res).toBeTruthy();
    expect(res.statusCode).toEqual(401);
    expect(res.body).toEqual(JSON.stringify({ message: "User is not authenticated" }));
  });

  it("should return 500, if the user does not have an email", async () => {
    setMockUsername(NO_EMAIL_STATE_SUBMITTER_USERNAME);

    const event = {
      body: "test",
      requestContext: getRequestContext(),
    } as APIGatewayEvent;

    const handler = middy().use(httpErrorHandler()).use(isAuthenticated());

    const res = await handler(event, {} as Context);

    expect(res).toBeTruthy();
    expect(res.statusCode).toEqual(500);
    expect(res.body).toEqual(JSON.stringify({ message: "User is not valid" }));
  });

  it("should set the user's role to `norole`, if they do not have an active role", async () => {
    setMockUsername(CO_STATE_SUBMITTER_USERNAME);

    const event = {
      body: "test",
      requestContext: getRequestContext(),
    } as APIGatewayEvent;

    const handler = middy()
      .use(isAuthenticated())
      .before(async (request: Request) => {
        const user = await getUser(request);
        expect(user?.cognitoUser.role).toEqual("norole");
      })
      .handler(() => ({
        statusCode: 200,
        body: "OK",
      }));

    const res = await handler(event, {} as Context);

    expect(res).toBeTruthy();
    expect(res.statusCode).toEqual(200);
    expect(res.body).toEqual("OK");
  });

  it("should get the active states for a non-CMS user", async () => {
    const event = {
      body: "test",
      requestContext: getRequestContext(),
    } as APIGatewayEvent;

    const states: string[] = Array.from(
      new Set(
        ((getFilteredRoleDocsByEmail(TEST_STATE_SUBMITTER_EMAIL) as roles.Document[]) || [])
          .filter((role) => role.status === "active")
          .map((role) => role.territory.toUpperCase()),
      ),
    );

    const handler = middy()
      .use(isAuthenticated())
      .before(async (request: Request) => {
        const user = await getUser(request);
        expect(user?.cognitoUser.states).toEqual(states);
      })
      .handler(() => ({
        statusCode: 200,
        body: "OK",
      }));

    const res = await handler(event, {} as Context);

    expect(res).toBeTruthy();
    expect(res.statusCode).toEqual(200);
    expect(res.body).toEqual("OK");
  });

  it("should not get states for CMS users", async () => {
    setMockUsername(TEST_REVIEWER_USERNAME);

    const event = {
      body: "test",
      requestContext: getRequestContext(),
    } as APIGatewayEvent;

    const handler = middy()
      .use(isAuthenticated())
      .before(async (request: Request) => {
        const user = await getUser(request);
        expect(user?.cognitoUser.states).toEqual([]);
      })
      .handler(() => ({
        statusCode: 200,
        body: "OK",
      }));

    const res = await handler(event, {} as Context);

    expect(res).toBeTruthy();
    expect(res.statusCode).toEqual(200);
    expect(res.body).toEqual("OK");
  });

  it("should get the user details and roles by default", async () => {
    const event = {
      body: "test",
      requestContext: getRequestContext(),
    } as APIGatewayEvent;

    const userProfile =
      (getFilteredRoleDocsByEmail(TEST_STATE_SUBMITTER_EMAIL) as roles.Document[]) || [];
    const states: string[] = Array.from(
      new Set(
        userProfile
          .filter((role) => role.status === "active")
          .map((role) => role.territory.toUpperCase()),
      ),
    );

    const handler = middy()
      .use(isAuthenticated())
      .before(async (request: Request) => {
        const user = await getUser(request);
        expect(user).toEqual({
          cognitoUser: {
            ...TEST_STATE_SUBMITTER_USER,
            role: "statesubmitter",
            states,
          },
          userDetails: osUsers[TEST_STATE_SUBMITTER_EMAIL]._source,
          userProfile,
        });
      })
      .handler(() => ({
        statusCode: 200,
        body: "OK",
      }));

    const res = await handler(event, {} as Context);

    expect(res).toBeTruthy();
    expect(res.statusCode).toEqual(200);
    expect(res.body).toEqual("OK");
  });

  it("should not get the user details, if withDetails is false", async () => {
    const event = {
      body: "test",
      requestContext: getRequestContext(),
    } as APIGatewayEvent;

    const userProfile =
      (getFilteredRoleDocsByEmail(TEST_STATE_SUBMITTER_EMAIL) as roles.Document[]) || [];
    const states: string[] = Array.from(
      new Set(
        userProfile
          .filter((role) => role.status === "active")
          .map((role) => role.territory.toUpperCase()),
      ),
    );

    const handler = middy()
      .use(isAuthenticated({ withDetails: false }))
      .before(async (request: Request) => {
        const user = await getUser(request);
        expect(user).toEqual({
          cognitoUser: {
            ...TEST_STATE_SUBMITTER_USER,
            role: "statesubmitter",
            states,
          },
          userDetails: null,
          userProfile,
        });
      })
      .handler(() => ({
        statusCode: 200,
        body: "OK",
      }));

    const res = await handler(event, {} as Context);

    expect(res).toBeTruthy();
    expect(res.statusCode).toEqual(200);
    expect(res.body).toEqual("OK");
  });

  it("should not get the user roles, if withProfile is false", async () => {
    const event = {
      body: "test",
      requestContext: getRequestContext(),
    } as APIGatewayEvent;

    const handler = middy()
      .use(isAuthenticated({ withRoles: false }))
      .before(async (request: Request) => {
        const user = await getUser(request);
        expect(user).toEqual({
          cognitoUser: {
            ...TEST_STATE_SUBMITTER_USER,
            role: "statesubmitter",
            states: [],
          },
          userDetails: osUsers[TEST_STATE_SUBMITTER_EMAIL]._source,
          userProfile: [],
        });
      })
      .handler(() => ({
        statusCode: 200,
        body: "OK",
      }));

    const res = await handler(event, {} as Context);

    expect(res).toBeTruthy();
    expect(res.statusCode).toEqual(200);
    expect(res.body).toEqual("OK");
  });

  it("should store the user internally and in context if setToContext is true", async () => {
    const event = {
      body: "test",
      requestContext: getRequestContext(),
    } as APIGatewayEvent;

    const userProfile =
      (getFilteredRoleDocsByEmail(TEST_STATE_SUBMITTER_EMAIL) as roles.Document[]) || [];
    const states: string[] = Array.from(
      new Set(
        userProfile
          .filter((role) => role.status === "active")
          .map((role) => role.territory.toUpperCase()),
      ),
    );

    const expectedUser = {
      cognitoUser: {
        ...TEST_STATE_SUBMITTER_USER,
        role: "statesubmitter",
        states,
      },
      userDetails: osUsers[TEST_STATE_SUBMITTER_EMAIL]._source,
      userProfile,
    };

    const handler = middy()
      .use(isAuthenticated({ setToContext: true }))
      .before(async (request: Request) => {
        const user = await getUser(request);
        expect(user).toEqual(expectedUser);
      })
      .handler((event: APIGatewayEvent, context: Context & { user: MiddyUser }) => {
        const { user } = context;
        expect(user).toEqual(expectedUser);
        return {
          statusCode: 200,
          body: "OK",
        };
      });

    const res = await handler(event, {} as Context);

    expect(res).toBeTruthy();
    expect(res.statusCode).toEqual(200);
    expect(res.body).toEqual("OK");
  });
});
