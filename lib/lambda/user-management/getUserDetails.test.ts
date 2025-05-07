import { APIGatewayEvent } from "aws-lambda";
import {
  errorRoleSearchHandler,
  getRequestContext,
  makoStateSubmitter,
  noStateSubmitter,
  osStateSystemAdmin,
  setDefaultStateSubmitter,
  setMockUsername,
  STATE_SYSTEM_ADMIN_EMAIL,
  TEST_STATE_SUBMITTER_EMAIL,
} from "mocks";
import { mockedServiceServer as mockedServer } from "mocks/server";
import { beforeEach, describe, expect, it } from "vitest";

import { handler } from "./getUserDetails";

describe("getUserDetails handler", () => {
  beforeEach(() => {
    setDefaultStateSubmitter();
  });

  it("should return 400 if the request context is missing", async () => {
    const event = {} as APIGatewayEvent;

    const res = await handler(event);

    expect(res.statusCode).toEqual(400);
    expect(res.body).toEqual(JSON.stringify({ message: "Request context required" }));
  });

  it("should return 401 if the user is not authenticated", async () => {
    setMockUsername(null);

    const event = {
      requestContext: getRequestContext(),
    } as APIGatewayEvent;

    const res = await handler(event);

    expect(res.statusCode).toEqual(401);
    expect(res.body).toEqual(JSON.stringify({ message: "User not authenticated" }));
  });

  it("should return 200 and the users details", async () => {
    const event = {
      requestContext: getRequestContext(),
    } as APIGatewayEvent;

    const res = await handler(event);

    expect(res.statusCode).toEqual(200);
    expect(res.body).toEqual(
      JSON.stringify({
        id: "mako.stateuser@gmail.com",
        eventType: "user-info",
        email: "mako.stateuser@gmail.com",
        fullName: "Stateuser Tester",
        role: "statesubmitter",
      }),
    );
  });

  it("should return 200 and the users details with norole role", async () => {
    setMockUsername(noStateSubmitter);
    const event = {
      requestContext: getRequestContext(),
    } as APIGatewayEvent;

    const res = await handler(event);

    expect(res.statusCode).toEqual(200);
    expect(res.body).toEqual(
      JSON.stringify({
        id: "nostate@example.com",
        eventType: "user-info",
        email: "nostate@example.com",
        fullName: "No State",
        role: "norole",
      }),
    );
  });

  it("should return 200 and the user details for the email in the body if the user is a user manager", async () => {
    setMockUsername(makoStateSubmitter);

    const event = {
      requestContext: getRequestContext(),
      body: JSON.stringify({
        userEmail: TEST_STATE_SUBMITTER_EMAIL,
      }),
    } as APIGatewayEvent;

    const res = await handler(event);

    expect(res.statusCode).toEqual(200);
    expect(res.body).toEqual(
      JSON.stringify({
        id: TEST_STATE_SUBMITTER_EMAIL,
        eventType: "user-info",
        email: TEST_STATE_SUBMITTER_EMAIL,
        fullName: "Stateuser Tester",
        role: "statesubmitter",
      }),
    );
  });

  it("should return 200 and the current user details if the user email in the body matches and the user is a user manager", async () => {
    setMockUsername(osStateSystemAdmin);

    const event = {
      requestContext: getRequestContext(),
      body: JSON.stringify({
        userEmail: STATE_SYSTEM_ADMIN_EMAIL,
      }),
    } as APIGatewayEvent;

    const res = await handler(event);

    expect(res.statusCode).toEqual(200);
    expect(res.body).toEqual(
      JSON.stringify({
        id: STATE_SYSTEM_ADMIN_EMAIL,
        eventType: "user-info",
        email: STATE_SYSTEM_ADMIN_EMAIL,
        fullName: "Statesystemadmin Nightwatch",
        role: "statesystemadmin",
      }),
    );
  });

  it("should return 200 and the current user details if the user is not a user manager", async () => {
    const event = {
      requestContext: getRequestContext(),
      body: JSON.stringify({
        userEmail: STATE_SYSTEM_ADMIN_EMAIL,
      }),
    } as APIGatewayEvent;

    const res = await handler(event);

    expect(res.statusCode).toEqual(200);
    expect(res.body).toEqual(
      JSON.stringify({
        id: TEST_STATE_SUBMITTER_EMAIL,
        eventType: "user-info",
        email: TEST_STATE_SUBMITTER_EMAIL,
        fullName: "Stateuser Tester",
        role: "statesubmitter",
      }),
    );
  });

  it("should return 500 if there is an error", async () => {
    mockedServer.use(errorRoleSearchHandler);
    const event = {
      requestContext: getRequestContext(),
    } as APIGatewayEvent;

    const res = await handler(event);

    expect(res.statusCode).toEqual(500);
    expect(res.body).toEqual(JSON.stringify({ message: 'Error: "Internal server error"' }));
  });
});
