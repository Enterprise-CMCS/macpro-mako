import { APIGatewayEvent } from "aws-lambda";
import {
  errorRoleSearchHandler,
  getRequestContext,
  noStateSubmitter,
  setDefaultStateSubmitter,
  setMockUsername,
} from "mocks";
import { mockedServiceServer as mockedServer } from "mocks/server";
import { beforeEach, describe, expect, it } from "vitest";

import { handler } from "./getUserProfile";

describe("getUserProfile handler", () => {
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
      requestContext: getRequestContext(),
    } as APIGatewayEvent;

    const res = await handler(event);

    expect(res.statusCode).toEqual(200);
    expect(res.body).toEqual(JSON.stringify([]));
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
