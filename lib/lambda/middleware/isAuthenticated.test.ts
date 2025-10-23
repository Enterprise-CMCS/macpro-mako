import middy, { Request } from "@middy/core";
import httpErrorHandler from "@middy/http-error-handler";
import { APIGatewayEvent, APIGatewayEventRequestContext, Context } from "aws-lambda";
import {
  CO_STATE_SUBMITTER_USER,
  CO_STATE_SUBMITTER_USERNAME,
  COGNITO_IDP_DOMAIN,
  errorIdentityProviderServiceHandler,
  errorRoleSearchHandler,
  getActiveStatesForUserByEmail,
  getRequestContext,
  NO_EMAIL_STATE_SUBMITTER_USERNAME,
  setMockUsername,
  TEST_REVIEWER_USER,
  TEST_REVIEWER_USERNAME,
  TEST_STATE_SUBMITTER_EMAIL,
  TEST_STATE_SUBMITTER_USER,
  TEST_STATE_SUBMITTER_USERNAME,
} from "mocks";
import { mockedServiceServer as mockedServer } from "mocks/server";
import { FullUser } from "shared-types";
import { describe, expect, it } from "vitest";

import { isAuthenticated, IsAuthenticatedOptions } from "./isAuthenticated";
import { ContextWithAuthenticatedUser, getAuthUserFromRequest } from "./utils";

const testStateSubmitterStates: string[] =
  getActiveStatesForUserByEmail(TEST_STATE_SUBMITTER_EMAIL, "statesubmitter") || [];
const testStateSubmitterUser: FullUser = {
  ...TEST_STATE_SUBMITTER_USER,
  role: "statesubmitter",
  states: testStateSubmitterStates,
};

const setupHandler = ({
  expectedUser = undefined,
  options = {
    setToContext: false,
  },
}: {
  expectedUser?: FullUser;
  options?: IsAuthenticatedOptions;
} = {}) => {
  return middy()
    .use(
      httpErrorHandler({ fallbackMessage: JSON.stringify({ message: "Internal server error" }) }),
    )
    .use(isAuthenticated(options))
    .before(async (request: Request) => {
      const user = await getAuthUserFromRequest(request);
      expect(user).toEqual(expectedUser);
    })
    .handler(
      (
        event: APIGatewayEvent,
        context: Context & { authenticatedUser?: ContextWithAuthenticatedUser },
      ) => {
        if (options.setToContext) {
          const { authenticatedUser } = context;
          expect(authenticatedUser).toEqual(expectedUser);
        }
        return {
          statusCode: 200,
          body: "OK",
        };
      },
    );
};

describe("isAuthenticated", () => {
  it("should return 401, if there is no request context", async () => {
    const event = {
      body: "test",
    } as APIGatewayEvent;

    const handler = setupHandler();

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

    const handler = setupHandler();

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

    const handler = setupHandler();

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

    const handler = setupHandler();

    const res = await handler(event, {} as Context);

    expect(res).toBeTruthy();
    expect(res.statusCode).toEqual(401);
    expect(res.body).toEqual(JSON.stringify({ message: "User is not authenticated" }));
  });

  it("should return 500, if there is an error getting the user's attributes", async () => {
    mockedServer.use(errorIdentityProviderServiceHandler);

    const event = {
      body: "test",
      requestContext: getRequestContext(),
    } as APIGatewayEvent;

    const handler = setupHandler({
      expectedUser: testStateSubmitterUser,
    });

    const res = await handler(event, {} as Context);

    expect(res).toBeTruthy();
    expect(res.statusCode).toEqual(500);
    expect(res.body).toEqual(JSON.stringify({ message: "Internal server error" }));
  });

  it("should return 500, if there is an error getting the user's states", async () => {
    mockedServer.use(errorRoleSearchHandler);

    const event = {
      body: "test",
      requestContext: getRequestContext(),
    } as APIGatewayEvent;

    const handler = setupHandler({
      expectedUser: testStateSubmitterUser,
    });

    const res = await handler(event, {} as Context);

    expect(res).toBeTruthy();
    expect(res.statusCode).toEqual(500);
    expect(res.body).toEqual(JSON.stringify({ message: "Internal server error" }));
  });

  it("should return 500, if the user does not have an email", async () => {
    setMockUsername(NO_EMAIL_STATE_SUBMITTER_USERNAME);

    const event = {
      body: "test",
      requestContext: getRequestContext(),
    } as APIGatewayEvent;

    const handler = setupHandler();

    const res = await handler(event, {} as Context);

    expect(res).toBeTruthy();
    expect(res.statusCode).toEqual(500);
    expect(res.body).toEqual(JSON.stringify({ message: "User is invalid" }));
  });

  it("should set the user's role to `norole`, if they do not have an active role", async () => {
    setMockUsername(CO_STATE_SUBMITTER_USERNAME);

    const event = {
      body: "test",
      requestContext: getRequestContext(),
    } as APIGatewayEvent;

    const handler = setupHandler({
      expectedUser: {
        ...CO_STATE_SUBMITTER_USER,
        role: "norole",
        states: [],
      },
    });

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

    const handler = setupHandler({
      expectedUser: testStateSubmitterUser,
    });

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

    const handler = setupHandler({
      expectedUser: {
        ...TEST_REVIEWER_USER,
        // @ts-ignore not added in lookupUserAttributes
        "custom:cms-roles": undefined,
        // @ts-ignore
        "custom:ismemberof": "ONEMAC_USER_D",
        role: "cmsreviewer",
        states: [],
      },
    });

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

    const handler = setupHandler({
      expectedUser: testStateSubmitterUser,
    });

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

    const handler = setupHandler({
      expectedUser: testStateSubmitterUser,
      options: { setToContext: true },
    });

    const res = await handler(event, {} as Context);

    expect(res).toBeTruthy();
    expect(res.statusCode).toEqual(200);
    expect(res.body).toEqual("OK");
  });
});
