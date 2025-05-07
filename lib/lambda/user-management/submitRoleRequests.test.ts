import { APIGatewayEvent } from "aws-lambda";
import {
  errorRoleSearchHandler,
  getRequestContext,
  helpDeskUser,
  mockedProducer,
  multiStateSubmitter,
  noStateSubmitter,
  osStateSystemAdmin,
  setDefaultStateSubmitter,
  setMockUsername,
  systemAdmin,
} from "mocks";
import { mockedServiceServer as mockedServer } from "mocks/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

import * as submitGroupDivision from "./submitGroupDivision";
import { handler } from "./submitRoleRequests";

describe("submitRoleRequests handler", () => {
  beforeEach(() => {
    setDefaultStateSubmitter();
    process.env.topicName = "request-role";
  });

  it("should return 400 if the event body is missing", async () => {
    const event = {} as APIGatewayEvent;

    const res = await handler(event);

    expect(res.statusCode).toEqual(400);
    expect(res.body).toEqual(JSON.stringify({ message: "Event body required" }));
  });

  it("should return 400 if the request context is missing", async () => {
    const event = {
      body: JSON.stringify({}),
    } as APIGatewayEvent;

    const res = await handler(event);

    expect(res.statusCode).toEqual(400);
    expect(res.body).toEqual(JSON.stringify({ message: "Request context required" }));
  });

  it("should throw an error if the topicName is not set", async () => {
    delete process.env.topicName;

    const event = {
      body: JSON.stringify({}),
      requestContext: getRequestContext(),
    } as APIGatewayEvent;

    expect(() => handler(event)).rejects.toThrowError("Topic name is not defined");
  });

  it("should return 401 if the user is not authenticated", async () => {
    setMockUsername(null);

    const event = {
      body: JSON.stringify({}),
      requestContext: getRequestContext(),
    } as APIGatewayEvent;

    const res = await handler(event);

    expect(res.statusCode).toEqual(401);
    expect(res.body).toEqual(JSON.stringify({ message: "User not authenticated" }));
  });

  it("should return 403 if the user does not have an active role", async () => {
    setMockUsername(noStateSubmitter);

    const event = {
      body: JSON.stringify({}),
      requestContext: getRequestContext(),
    } as APIGatewayEvent;

    const res = await handler(event);

    expect(res.statusCode).toEqual(403);
    expect(res.body).toEqual(JSON.stringify({ message: "No active role found for user" }));
  });

  // it("should return 400 if the grantAccess is missing", async () => {
  //   setMockUsername(osStateSystemAdmin);
  //   const event = {
  //     body: JSON.stringify({
  //       email: "nostate@example.com",
  //       state: "MD",
  //       role: "statesubmitter",
  //       eventType: "user-role",
  //     }),
  //     requestContext: getRequestContext(),
  //   } as APIGatewayEvent;

  //   const res = await handler(event);

  //   expect(res.statusCode).toEqual(400);
  //   expect(res.body).toEqual(JSON.stringify({ message: "Invalid or missing grantAccess value." }));
  // });

  it("should return 200 if the user is allowed to update the access", async () => {
    mockedProducer.send.mockResolvedValueOnce([{ message: "sent" }]);
    setMockUsername(osStateSystemAdmin);
    const event = {
      body: JSON.stringify({
        email: "nostate@example.com",
        state: "MD",
        role: "statesubmitter",
        eventType: "user-role",
        grantAccess: "active",
        requestRoleChange: false,
      }),
      requestContext: getRequestContext(),
    } as APIGatewayEvent;

    const res = await handler(event);

    expect(res.statusCode).toEqual(200);
    expect(JSON.parse(res.body)).toEqual({
      message: "Request to access MD has been submitted.",
      eventType: "user-role",
      email: "nostate@example.com",
      status: "active",
      territory: "MD",
      role: "statesubmitter",
      doneByEmail: "statesystemadmin@nightwatch.test",
      doneByName: "Statesystemadmin Nightwatch",
      date: expect.any(Number),
    });
  });

  it("should return 200 if the user is allowed to request access", async () => {
    mockedProducer.send.mockResolvedValueOnce([{ message: "sent" }]);
    setMockUsername(multiStateSubmitter);
    const event = {
      body: JSON.stringify({
        email: "multistate@example.com",
        state: "CO",
        role: "statesubmitter",
        eventType: "user-role",
        grantAccess: true,
        requestRoleChange: true,
      }),
      requestContext: getRequestContext(),
    } as APIGatewayEvent;

    const res = await handler(event);

    expect(res.statusCode).toEqual(200);
    expect(JSON.parse(res.body)).toEqual({
      message: "Request to access CO has been submitted.",
      eventType: "user-role",
      email: "multistate@example.com",
      status: "pending",
      territory: "CO",
      role: "statesubmitter",
      doneByEmail: "multistate@example.com",
      doneByName: "Multi State",
      date: expect.any(Number),
    });
  });

  it("should return 200 if the user is allowed to self revoke access", async () => {
    mockedProducer.send.mockResolvedValueOnce([{ message: "sent" }]);
    setMockUsername(multiStateSubmitter);
    const event = {
      body: JSON.stringify({
        email: "multistate@example.com",
        state: "CO",
        role: "statesubmitter",
        eventType: "user-role",
        grantAccess: "revoked",
        requestRoleChange: false,
      }),
      requestContext: getRequestContext(),
    } as APIGatewayEvent;

    const res = await handler(event);

    expect(res.statusCode).toEqual(200);
    expect(JSON.parse(res.body)).toEqual({
      message: "Request to access CO has been submitted.",
      eventType: "user-role",
      email: "multistate@example.com",
      status: "revoked",
      territory: "CO",
      role: "statesubmitter",
      doneByEmail: "multistate@example.com",
      doneByName: "Multi State",
      date: expect.any(Number),
    });
  });

  it("should call submitGroupDivision if user is a systemadmin updating a cmsroleapprover", async () => {
    const submitGroupDivisionSpy = vi.spyOn(submitGroupDivision, "submitGroupDivision");
    mockedProducer.send.mockResolvedValueOnce([{ message: "sent" }]);
    setMockUsername(systemAdmin);
    const event = {
      body: JSON.stringify({
        email: "reviewer@example.com",
        state: "N/A",
        role: "cmsroleapprover",
        eventType: "user-role",
        grantAccess: true,
        group: "ABC",
        division: "ABCDE",
      }),
      requestContext: getRequestContext(),
    } as APIGatewayEvent;

    const res = await handler(event);

    expect(res.statusCode).toEqual(200);
    expect(submitGroupDivisionSpy).toHaveBeenCalled();
  });

  it("should return 403 if the currentUserRole cannot request updates", async () => {
    setMockUsername(helpDeskUser);
    const event = {
      body: JSON.stringify({
        email: "helpdesk@example.com",
        state: "MD",
        role: "defaultcmsuser",
        eventType: "user-role",
        grantAccess: true,
      }),
      requestContext: getRequestContext(),
    } as APIGatewayEvent;

    const res = await handler(event);

    expect(res.statusCode).toEqual(403);
    expect(res.body).toEqual(
      JSON.stringify({ message: "You are not authorized to perform this action." }),
    );
  });

  it("should return 500 if there is an error", async () => {
    mockedServer.use(errorRoleSearchHandler);
    setMockUsername(multiStateSubmitter);
    const event = {
      body: JSON.stringify({
        email: "multistate@example.com",
        state: "CO",
        role: "statesubmitter",
        eventType: "user-role",
        grantAccess: true,
      }),
      requestContext: getRequestContext(),
    } as APIGatewayEvent;

    const res = await handler(event);

    expect(res.statusCode).toEqual(500);
    expect(res.body).toEqual(JSON.stringify({ message: "Internal server error" }));
  });
});
