import { APIGatewayEvent, Context } from "aws-lambda";
import {
  errorRoleSearchHandler,
  getRequestContext,
  NO_EMAIL_STATE_SUBMITTER_USERNAME,
  NO_STATE_SUBMITTER_EMAIL,
  NO_STATE_SUBMITTER_USERNAME,
  OS_STATE_SYSTEM_ADMIN_EMAIL,
  osUsers,
  setDefaultStateSubmitter,
  setMockUsername,
  TEST_STATE_SUBMITTER_EMAIL,
  TEST_STATE_SUBMITTER_USERNAME,
} from "mocks";
import { mockedServiceServer as mockedServer } from "mocks/server";
import { beforeEach, describe, expect, it } from "vitest";

import { handler } from "./getUserDetails";

describe("getUserDetails handler", () => {
  beforeEach(() => {
    setDefaultStateSubmitter();
  });

  it("should return 400, if the event body is missing", async () => {
    const event = {} as APIGatewayEvent;

    const res = await handler(event, {} as Context);

    expect(res.statusCode).toEqual(400);
    expect(res.body).toEqual(JSON.stringify({ message: "Event body required" }));
  });

  it("should return 401, if the user is not authenticated", async () => {
    setMockUsername(null);

    const event = {
      body: JSON.stringify({}),
      requestContext: getRequestContext(),
    } as APIGatewayEvent;

    const res = await handler(event, {} as Context);

    expect(res.statusCode).toEqual(401);
    expect(res.body).toEqual(JSON.stringify({ message: "User is not authenticated" }));
  });

  it("should return 500, if the user does not have an email", async () => {
    setMockUsername(NO_EMAIL_STATE_SUBMITTER_USERNAME);

    const event = {
      body: JSON.stringify({}),
      requestContext: getRequestContext(),
    } as APIGatewayEvent;

    const res = await handler(event, {} as Context);

    expect(res.statusCode).toEqual(500);
    expect(res.body).toEqual(JSON.stringify({ message: "User is invalid" }));
  });

  it("should return 200 and the authenticated user's details, if there is no userEmail in the request body", async () => {
    const event = {
      body: JSON.stringify({}),
      requestContext: getRequestContext(),
    } as APIGatewayEvent;

    const expectedUser = {
      ...osUsers[TEST_STATE_SUBMITTER_EMAIL]._source,
      role: "statesubmitter",
      states: ["VA", "OH", "SC", "CO", "GA", "MD"],
    };

    const res = await handler(event, {} as Context);

    expect(res.statusCode).toEqual(200);
    expect(res.body).toEqual(JSON.stringify(expectedUser));
  });

  it("should return 200 and the authenticated user's details with `norole` role, if they do not have an active role", async () => {
    setMockUsername(NO_STATE_SUBMITTER_USERNAME);

    const event = {
      body: JSON.stringify({}),
      requestContext: getRequestContext(),
    } as APIGatewayEvent;

    const expectedUser = {
      ...osUsers[NO_STATE_SUBMITTER_EMAIL]._source,
      role: "norole",
      states: [],
    };

    const res = await handler(event, {} as Context);

    expect(res.statusCode).toEqual(200);
    expect(res.body).toEqual(JSON.stringify(expectedUser));
  });

  it("should return 200 and the authenticated user's details, if the userEmail in the request body matches and the authenticated user's email", async () => {
    const event = {
      requestContext: getRequestContext(),
      body: JSON.stringify({
        userEmail: TEST_STATE_SUBMITTER_EMAIL,
      }),
    } as APIGatewayEvent;

    const expectedUser = {
      ...osUsers[TEST_STATE_SUBMITTER_EMAIL]._source,
      role: "statesubmitter",
      states: ["VA", "OH", "SC", "CO", "GA", "MD"],
    };

    const res = await handler(event, {} as Context);

    expect(res.statusCode).toEqual(200);
    expect(res.body).toEqual(JSON.stringify(expectedUser));
  });

  it("should return 200 and the user details for the userEmail in the request body, if the authenticated user is a user manager", async () => {
    setMockUsername(TEST_STATE_SUBMITTER_USERNAME);

    const event = {
      requestContext: getRequestContext(),
      body: JSON.stringify({
        userEmail: TEST_STATE_SUBMITTER_EMAIL,
      }),
    } as APIGatewayEvent;

    const expectedUser = {
      ...osUsers[TEST_STATE_SUBMITTER_EMAIL]._source,
      role: "statesubmitter",
      states: ["VA", "OH", "SC", "CO", "GA", "MD"],
    };

    const res = await handler(event, {} as Context);

    expect(res.statusCode).toEqual(200);
    expect(res.body).toEqual(JSON.stringify(expectedUser));
  });

  it("should return 403, if userEmail in the request body does not match the authenticated user's email and the authenticated user is not a user manager", async () => {
    const event = {
      requestContext: getRequestContext(),
      body: JSON.stringify({
        userEmail: OS_STATE_SYSTEM_ADMIN_EMAIL,
      }),
    } as APIGatewayEvent;

    const res = await handler(event, {} as Context);

    expect(res.statusCode).toEqual(403);
    expect(res.body).toEqual(
      JSON.stringify({
        message: "Not authorized to view this resource",
      }),
    );
  });

  it("should return 500 if there is an error", async () => {
    mockedServer.use(errorRoleSearchHandler);

    const event = {
      body: JSON.stringify({}),
      requestContext: getRequestContext(),
    } as APIGatewayEvent;

    const res = await handler(event, {} as Context);

    expect(res.statusCode).toEqual(500);
    expect(res.body).toEqual(JSON.stringify({ message: "Internal server error" }));
  });
});
