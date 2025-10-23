import { APIGatewayEvent, Context } from "aws-lambda";
import {
  errorRoleSearchHandler,
  getRequestContext,
  NO_EMAIL_STATE_SUBMITTER_USERNAME,
  noStateSubmitter,
  OS_STATE_SYSTEM_ADMIN_EMAIL,
  osStateSystemAdmin,
  setDefaultStateSubmitter,
  setMockUsername,
  TEST_STATE_SUBMITTER_EMAIL,
  testStateSubmitter,
} from "mocks";
import { mockedServiceServer as mockedServer } from "mocks/server";
import { beforeEach, describe, expect, it } from "vitest";

import { handler } from "./getUserProfile";

describe("getUserProfile handler", () => {
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

  it("should return 200 and the authenticated user's details, if there is no userEmail", async () => {
    const event = {
      body: JSON.stringify({}),
      requestContext: getRequestContext(),
    } as APIGatewayEvent;

    const res = await handler(event, {} as Context);

    expect(res.statusCode).toEqual(200);
    expect(res.body).toEqual(
      JSON.stringify([
        {
          id: "mako.stateuser@gmail.com_VA_statesubmitter",
          eventType: "user-role",
          email: "mako.stateuser@gmail.com",
          doneByEmail: "VAapprover@email.com",
          doneByName: "VA Approver",
          status: "active",
          role: "statesubmitter",
          territory: "VA",
          lastModifiedDate: 1745245549866,
        },
        {
          id: "mako.stateuser@gmail.com_OH_statesubmitter",
          eventType: "user-role",
          email: "mako.stateuser@gmail.com",
          doneByEmail: "OHapprover",
          doneByName: "OH Approver",
          status: "active",
          role: "statesubmitter",
          territory: "OH",
          lastModifiedDate: 1745244450266,
        },
        {
          id: "mako.stateuser@gmail.com_SC_statesubmitter",
          eventType: "user-role",
          email: "mako.stateuser@gmail.com",
          doneByEmail: "SCapprover@email.com",
          doneByName: "SC Approver",
          status: "active",
          role: "statesubmitter",
          territory: "SC",
          lastModifiedDate: 1747764449866,
        },
        {
          id: "mako.stateuser@gmail.com_CO_statesubmitter",
          eventType: "user-role",
          email: "mako.stateuser@gmail.com",
          doneByEmail: "COapprover@email.com",
          doneByName: "CO Approver",
          status: "active",
          role: "statesubmitter",
          territory: "CO",
          lastModifiedDate: 1745456449866,
        },
        {
          id: "mako.stateuser@gmail.com_GA_statesubmitter",
          eventType: "user-role",
          email: "mako.stateuser@gmail.com",
          doneByEmail: "GAapprover@email.com",
          doneByName: "GA Approver",
          status: "active",
          role: "statesubmitter",
          territory: "GA",
          lastModifiedDate: 1745223549866,
        },
        {
          id: "mako.stateuser@gmail.com_MD_statesubmitter",
          eventType: "user-role",
          email: "mako.stateuser@gmail.com",
          doneByEmail: "statesystemadmin@nightwatch.test",
          doneByName: "Test Again",
          status: "active",
          role: "statesubmitter",
          territory: "MD",
          lastModifiedDate: 1745244568866,
        },
      ]),
    );
  });

  it("should return 200 and the authenticated user's details, if the userEmail in the event body matches and the authenticated user's email", async () => {
    setMockUsername(osStateSystemAdmin);
    const event = {
      requestContext: getRequestContext(),
      body: JSON.stringify({
        userEmail: OS_STATE_SYSTEM_ADMIN_EMAIL,
      }),
    } as APIGatewayEvent;

    const res = await handler(event, {} as Context);

    expect(res.statusCode).toEqual(200);
    expect(res.body).toEqual(
      JSON.stringify([
        {
          id: "statesystemadmin@nightwatch.test_MD_statesystemadmin",
          eventType: "legacy-user-role",
          email: "statesystemadmin@nightwatch.test",
          doneByEmail: "systemadmin@example.com",
          doneByName: "System Admin",
          status: "active",
          role: "statesystemadmin",
          territory: "MD",
          lastModifiedDate: 1745003573565,
        },
      ]),
    );
  });

  it("should return 200 and the user details for the userEmail in the event body, if the authenticated user is a user manager", async () => {
    setMockUsername(testStateSubmitter);
    const event = {
      requestContext: getRequestContext(),
      body: JSON.stringify({
        userEmail: TEST_STATE_SUBMITTER_EMAIL,
      }),
    } as APIGatewayEvent;

    const res = await handler(event, {} as Context);

    expect(res.statusCode).toEqual(200);
    expect(res.body).toEqual(
      JSON.stringify([
        {
          id: "mako.stateuser@gmail.com_VA_statesubmitter",
          eventType: "user-role",
          email: "mako.stateuser@gmail.com",
          doneByEmail: "VAapprover@email.com",
          doneByName: "VA Approver",
          status: "active",
          role: "statesubmitter",
          territory: "VA",
          lastModifiedDate: 1745245549866,
        },
        {
          id: "mako.stateuser@gmail.com_OH_statesubmitter",
          eventType: "user-role",
          email: "mako.stateuser@gmail.com",
          doneByEmail: "OHapprover",
          doneByName: "OH Approver",
          status: "active",
          role: "statesubmitter",
          territory: "OH",
          lastModifiedDate: 1745244450266,
        },
        {
          id: "mako.stateuser@gmail.com_SC_statesubmitter",
          eventType: "user-role",
          email: "mako.stateuser@gmail.com",
          doneByEmail: "SCapprover@email.com",
          doneByName: "SC Approver",
          status: "active",
          role: "statesubmitter",
          territory: "SC",
          lastModifiedDate: 1747764449866,
        },
        {
          id: "mako.stateuser@gmail.com_CO_statesubmitter",
          eventType: "user-role",
          email: "mako.stateuser@gmail.com",
          doneByEmail: "COapprover@email.com",
          doneByName: "CO Approver",
          status: "active",
          role: "statesubmitter",
          territory: "CO",
          lastModifiedDate: 1745456449866,
        },
        {
          id: "mako.stateuser@gmail.com_GA_statesubmitter",
          eventType: "user-role",
          email: "mako.stateuser@gmail.com",
          doneByEmail: "GAapprover@email.com",
          doneByName: "GA Approver",
          status: "active",
          role: "statesubmitter",
          territory: "GA",
          lastModifiedDate: 1745223549866,
        },
        {
          id: "mako.stateuser@gmail.com_MD_statesubmitter",
          eventType: "user-role",
          email: "mako.stateuser@gmail.com",
          doneByEmail: "statesystemadmin@nightwatch.test",
          doneByName: "Test Again",
          status: "active",
          role: "statesubmitter",
          territory: "MD",
          lastModifiedDate: 1745244568866,
        },
      ]),
    );
  });

  it("should return 200 and an empty array if the user has no roles", async () => {
    setMockUsername(noStateSubmitter);
    const event = {
      body: JSON.stringify({}),
      requestContext: getRequestContext(),
    } as APIGatewayEvent;

    const res = await handler(event, {} as Context);

    expect(res.statusCode).toEqual(200);
    expect(res.body).toEqual(JSON.stringify([]));
  });

  it("should return 403, if userEmail in the event body does not match the authenticated user's email and the authenticated user is not a user manager", async () => {
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
