import { APIGatewayEvent, Context } from "aws-lambda";
import { errorRoleSearchHandler, getRequestContext, setDefaultStateSubmitter } from "mocks";
import { mockedProducer } from "mocks/helpers/kafka.utils";
import { mockedServiceServer as mockedServer } from "mocks/server";
import { beforeEach, describe, expect, it } from "vitest";

import { handler } from "./updateUserRoles";

describe("updateUserRoles handler", () => {
  beforeEach(() => {
    setDefaultStateSubmitter();
    process.env.topicName = "create-user-profile";
  });

  it("should return 500, if the topicName is not set", async () => {
    delete process.env.topicName;

    const event = {
      body: JSON.stringify({}),
      requestContext: getRequestContext(),
    } as APIGatewayEvent;

    const res = await handler(event, {} as Context);

    expect(res).toBeTruthy();
    expect(res.statusCode).toEqual(500);
    expect(res.body).toEqual(JSON.stringify({ message: "Internal server error" }));
  });

  it("should return 400, if the event body is missing", async () => {
    const event = {} as APIGatewayEvent;

    const res = await handler(event, {} as Context);

    expect(res).toBeTruthy();
    expect(res.statusCode).toEqual(400);
    expect(res.body).toEqual(JSON.stringify({ message: "Event body required" }));
  });

  it("should return 400, if the event body is invalid", async () => {
    // @ts-ignore ignore invalid format for test
    const event = {
      body: JSON.stringify({
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
      }),
      requestContext: getRequestContext(),
    } as APIGatewayEvent;

    const res = await handler(event, {} as Context);

    expect(res.statusCode).toEqual(400);
    expect(JSON.parse(res.body)).toEqual(
      expect.objectContaining({ message: "Event failed validation" }),
    );
  });

  it("should return 200", async () => {
    mockedProducer.send.mockResolvedValueOnce([{ message: "sent" }]);
    // @ts-ignore
    const event = {
      body: JSON.stringify({
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
      }),
      requestContext: getRequestContext(),
    } as APIGatewayEvent;

    const res = await handler(event, {} as Context);

    expect(res.statusCode).toEqual(200);
    expect(res.body).toEqual(JSON.stringify({ message: "Roles have been updated." }));
  });

  it("should return 500, if there is an error getting the roles", async () => {
    mockedServer.use(errorRoleSearchHandler);

    // @ts-ignore
    const event = {
      body: JSON.stringify({
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
      }),
      requestContext: getRequestContext(),
    } as APIGatewayEvent;

    const res = await handler(event, {} as Context);

    expect(res.statusCode).toEqual(500);
    expect(res.body).toEqual(JSON.stringify({ message: "Internal server error" }));
  });

  it("should return 500 if there is an error producing the message", async () => {
    mockedProducer.send.mockRejectedValueOnce(new Error("Error"));

    // @ts-ignore
    const event = {
      body: JSON.stringify({
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
      }),
      requestContext: getRequestContext(),
    } as APIGatewayEvent;

    const res = await handler(event, {} as Context);

    expect(res.statusCode).toEqual(500);
    expect(res.body).toEqual(JSON.stringify({ message: "Internal server error" }));
  });
});
