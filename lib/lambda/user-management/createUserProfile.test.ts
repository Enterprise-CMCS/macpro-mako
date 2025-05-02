import { APIGatewayEvent } from "aws-lambda";
import {
  coStateSubmitter,
  getRequestContext,
  makoStateSubmitter,
  mockedProducer,
  setDefaultStateSubmitter,
  setMockUsername,
  testNewStateSubmitter,
} from "mocks";
import { beforeEach, describe, expect, it } from "vitest";

import { handler } from "./createUserProfile";

describe("createUserProfile handler", () => {
  beforeEach(() => {
    setDefaultStateSubmitter();
    process.env.topicName = "create-user-profile";
  });

  it("should return 400 if the request context is missing", async () => {
    const event = {} as APIGatewayEvent;

    const res = await handler(event);

    expect(res.statusCode).toEqual(400);
    expect(res.body).toEqual(JSON.stringify({ message: "Request context required" }));
  });

  it("should throw an error if the topicName is not set", async () => {
    delete process.env.topicName;

    const event = {
      requestContext: getRequestContext(),
    } as APIGatewayEvent;

    expect(() => handler(event)).rejects.toThrowError("Topic name is not defined");
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

  it("should return 200 and create the user role if the user role is not in kafka", async () => {
    mockedProducer.send.mockResolvedValueOnce([{ message: "sent" }]);
    setMockUsername(coStateSubmitter);

    const event = {
      requestContext: getRequestContext(),
    } as APIGatewayEvent;

    const res = await handler(event);

    expect(res.statusCode).toEqual(200);
    expect(res.body).toEqual(JSON.stringify({ message: "User profile created" }));
  });

  it("should return 200 and not create the user role if it is already in kafka", async () => {
    setMockUsername(makoStateSubmitter);

    const event = {
      requestContext: getRequestContext(),
    } as APIGatewayEvent;

    const res = await handler(event);

    expect(res.statusCode).toEqual(200);
    expect(res.body).toEqual(JSON.stringify({ message: "User profile already exists" }));
  });

  it("should return 500 if the user is not in kafka", async () => {
    mockedProducer.send.mockRejectedValueOnce(new Error("Error"));
    setMockUsername(testNewStateSubmitter);

    const event = {
      requestContext: getRequestContext(),
    } as APIGatewayEvent;

    const res = await handler(event);

    expect(res.statusCode).toEqual(500);
    expect(res.body).toEqual(JSON.stringify({ message: "Internal server error" }));
  });
});
