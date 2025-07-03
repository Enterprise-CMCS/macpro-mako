import { APIGatewayEvent, Context } from "aws-lambda";
import {
  coStateSubmitter,
  getRequestContext,
  setDefaultStateSubmitter,
  setMockUsername,
  testNewStateSubmitter,
  testStateSubmitter,
} from "mocks";
import { mockedProducer } from "mocks/helpers/kafka.utils";
import { beforeEach, describe, expect, it } from "vitest";

import { handler } from "./createUserProfile";

describe("createUserProfile handler", () => {
  beforeEach(() => {
    setDefaultStateSubmitter();
    process.env.topicName = "create-user-profile";
  });

  it("should return 400 if the event body is missing", async () => {
    const event = {} as APIGatewayEvent;

    const res = await handler(event, {} as Context);

    expect(res.statusCode).toEqual(400);
    expect(res.body).toEqual(JSON.stringify({ message: "Event body required" }));
  });

  it("should throw an error if the topicName is not set", async () => {
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

  it("should return 401 if the user is not authenticated", async () => {
    setMockUsername(null);

    const event = {
      body: JSON.stringify({}),
      requestContext: getRequestContext(),
    } as APIGatewayEvent;

    const res = await handler(event, {} as Context);

    expect(res.statusCode).toEqual(401);
    expect(res.body).toEqual(JSON.stringify({ message: "User is not authenticated" }));
  });

  it("should return 200 and create the user role if the user role is not in kafka", async () => {
    mockedProducer.send.mockResolvedValueOnce([{ message: "sent" }]);
    setMockUsername(coStateSubmitter);

    const event = {
      body: JSON.stringify({}),
      requestContext: getRequestContext(),
    } as APIGatewayEvent;

    const res = await handler(event, {} as Context);

    expect(res.statusCode).toEqual(200);
    expect(res.body).toEqual(JSON.stringify({ message: "User profile created" }));
  });

  it("should return 200 and not create the user role if it is already in kafka", async () => {
    setMockUsername(testStateSubmitter);

    const event = {
      body: JSON.stringify({}),
      requestContext: getRequestContext(),
    } as APIGatewayEvent;

    const res = await handler(event, {} as Context);

    expect(res.statusCode).toEqual(200);
    expect(res.body).toEqual(JSON.stringify({ message: "User profile already exists" }));
  });

  it("should return 500 if the user is not in kafka", async () => {
    mockedProducer.send.mockRejectedValueOnce(new Error("Error"));
    setMockUsername(testNewStateSubmitter);

    const event = {
      body: JSON.stringify({}),
      requestContext: getRequestContext(),
    } as APIGatewayEvent;

    const res = await handler(event, {} as Context);

    expect(res.statusCode).toEqual(500);
    expect(res.body).toEqual(JSON.stringify({ message: "Internal server error" }));
  });
});
