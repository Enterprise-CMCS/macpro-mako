import { APIGatewayEvent } from "aws-lambda";
import {
  errorRoleSearchHandler,
  getRequestContext,
  mockedProducer,
  setDefaultStateSubmitter,
} from "mocks";
import { mockedServiceServer as mockedServer } from "mocks/server";
import { beforeEach, describe, expect, it } from "vitest";

import { handler } from "./updateUserRoles";

describe("updateUserRoles handler", () => {
  beforeEach(() => {
    setDefaultStateSubmitter();
    process.env.topicName = "create-user-profile";
  });

  it("should throw an error if the topicName is not set", async () => {
    delete process.env.topicName;

    const event = {
      requestContext: getRequestContext(),
    } as APIGatewayEvent;

    expect(() => handler(event)).rejects.toThrowError("Topic name is not defined");
  });

  it("should return 400 if the request context is missing", async () => {
    const event = {} as APIGatewayEvent;

    const res = await handler(event);

    expect(res.statusCode).toEqual(400);
    expect(res.body).toEqual(JSON.stringify({ message: "Event body required" }));
  });

  it("should return 400 if the event body is invalid", async () => {
    // @ts-ignore ignore invalid format for test
    const event = {
      body: {
        updatedRoles: [
          {
            id: "multistate@example.com_MD_statesubmitter",
            eventType: "user-role",
            email: "multistate@example.com",
            doneByEmail: "statesystemadmin@nightwatch.test",
            doneByName: "Test Again",
            status: "active",
            role: "state",
            territory: "MD",
            lastModifiedDate: 1745234449866,
          },
        ],
      },
      requestContext: getRequestContext(),
    } as APIGatewayEvent;

    const res = await handler(event);

    expect(res.statusCode).toEqual(400);
    expect(res.body).toEqual(
      JSON.stringify({
        message: "Incorrect role object format",
        error:
          '[\n  {\n    "received": "state",\n    "code": "invalid_enum_value",\n    "options": [\n      "defaultcmsuser",\n      "cmsroleapprover",\n      "cmsreviewer",\n      "statesystemadmin",\n      "helpdesk",\n      "statesubmitter",\n      "systemadmin"\n    ],\n    "path": [\n      "updatedRoles",\n      0,\n      "role"\n    ],\n    "message": "Invalid enum value. Expected \'defaultcmsuser\' | \'cmsroleapprover\' | \'cmsreviewer\' | \'statesystemadmin\' | \'helpdesk\' | \'statesubmitter\' | \'systemadmin\', received \'state\'"\n  }\n]',
      }),
    );
  });

  it("should return 200", async () => {
    mockedProducer.send.mockResolvedValueOnce([{ message: "sent" }]);
    // @ts-ignore
    const event = {
      body: {
        updatedRoles: [
          {
            id: "multistate@example.com_MD_statesubmitter",
            eventType: "user-role",
            email: "multistate@example.com",
            doneByEmail: "statesystemadmin@nightwatch.test",
            doneByName: "Test Again",
            status: "active",
            role: "statesystemadmin",
            territory: "MD",
            lastModifiedDate: 1745234449866,
          },
        ],
      },
      requestContext: getRequestContext(),
    } as APIGatewayEvent;

    const res = await handler(event);

    expect(res.statusCode).toEqual(200);
    expect(res.body).toEqual(JSON.stringify({ message: "Roles have been updated." }));
  });

  it("should return 500 if there is an error getting the roles", async () => {
    mockedServer.use(errorRoleSearchHandler);

    // @ts-ignore
    const event = {
      body: {
        updatedRoles: [
          {
            id: "multistate@example.com_MD_statesubmitter",
            eventType: "user-role",
            email: "multistate@example.com",
            doneByEmail: "statesystemadmin@nightwatch.test",
            doneByName: "Test Again",
            status: "active",
            role: "statesystemadmin",
            territory: "MD",
            lastModifiedDate: 1745234449866,
          },
        ],
      },
      requestContext: getRequestContext(),
    } as APIGatewayEvent;

    const res = await handler(event);

    expect(res.statusCode).toEqual(500);
    expect(res.body).toEqual(JSON.stringify({ message: "Internal server error" }));
  });

  it("should return 500 if there is an error producing the message", async () => {
    mockedProducer.send.mockRejectedValueOnce(new Error("Error"));

    // @ts-ignore
    const event = {
      body: {
        updatedRoles: [
          {
            id: "multistate@example.com_MD_statesubmitter",
            eventType: "user-role",
            email: "multistate@example.com",
            doneByEmail: "statesystemadmin@nightwatch.test",
            doneByName: "Test Again",
            status: "active",
            role: "statesystemadmin",
            territory: "MD",
            lastModifiedDate: 1745234449866,
          },
        ],
      },
      requestContext: getRequestContext(),
    } as APIGatewayEvent;

    const res = await handler(event);

    expect(res.statusCode).toEqual(500);
    expect(res.body).toEqual(JSON.stringify({ message: "Internal server error" }));
  });
});
