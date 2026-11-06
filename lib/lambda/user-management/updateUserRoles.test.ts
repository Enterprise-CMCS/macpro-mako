import { APIGatewayEvent, Context } from "aws-lambda";
import { produceMessage } from "libs/api/kafka";
import { getRequestContext, setDefaultStateSubmitter } from "mocks";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { handler } from "./updateUserRoles";

vi.mock("libs/api/kafka", () => ({
  produceMessage: vi.fn(),
}));

const mockedProduceMessage = vi.mocked(produceMessage);

describe("updateUserRoles handler", () => {
  beforeEach(() => {
    setDefaultStateSubmitter();
    process.env.topicName = "create-user-profile";
    mockedProduceMessage.mockReset();
    mockedProduceMessage.mockResolvedValue([{ message: "sent" }]);
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
    expect(mockedProduceMessage).not.toHaveBeenCalled();
  });

  it("should return 400 if an updated role is missing required fields", async () => {
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
    expect(mockedProduceMessage).not.toHaveBeenCalled();
  });

  it("should return 200", async () => {
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

  it("should return 500 if there is an error producing the message", async () => {
    mockedProduceMessage.mockRejectedValueOnce(new Error("Error"));

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
