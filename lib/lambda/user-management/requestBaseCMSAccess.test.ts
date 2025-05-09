import { APIGatewayEvent } from "aws-lambda";
import {
  automatedHelpDeskUser,
  automatedReviewer,
  coStateSubmitter,
  errorRoleSearchHandler,
  getRequestContext,
  mockedProducer,
  setDefaultStateSubmitter,
  setMockUsername,
} from "mocks";
import { mockedServiceServer as mockedServer } from "mocks/server";
import { beforeEach, describe, expect, it } from "vitest";

import { handler } from "./requestBaseCMSAccess";

describe("requestBaseCMSAccess handler", () => {
  beforeEach(() => {
    setDefaultStateSubmitter();
    process.env.topicName = "request-cms-access";
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

  it("should return 200 if user has roles", async () => {
    const event = {
      requestContext: getRequestContext(),
    } as APIGatewayEvent;

    const res = await handler(event);

    expect(res.statusCode).toEqual(200);
    expect(res.body).toEqual(JSON.stringify({ message: "User roles already created" }));
  });

  it("should return 200 if a CMS user does not have roles", async () => {
    mockedProducer.send.mockResolvedValueOnce([{ message: "sent" }]);
    setMockUsername(automatedReviewer);

    const event = {
      requestContext: getRequestContext(),
    } as APIGatewayEvent;

    const res = await handler(event);

    expect(res.statusCode).toEqual(200);
    expect(res.body).toEqual(
      JSON.stringify({ message: "User role updated, because no default role found" }),
    );
  });

  it("should return 200 if a CMS help desk user does not have roles", async () => {
    mockedProducer.send.mockResolvedValueOnce([{ message: "sent" }]);
    setMockUsername(automatedHelpDeskUser);

    const event = {
      requestContext: getRequestContext(),
    } as APIGatewayEvent;

    const res = await handler(event);

    expect(res.statusCode).toEqual(200);
    expect(res.body).toEqual(
      JSON.stringify({ message: "User role updated, because no default role found" }),
    );
  });

  it("should return 200 if a state user does not have roles", async () => {
    setMockUsername(coStateSubmitter);

    const event = {
      requestContext: getRequestContext(),
    } as APIGatewayEvent;

    const res = await handler(event);

    expect(res.statusCode).toEqual(200);
    expect(res.body).toEqual(JSON.stringify({ message: "User role not updated" }));
  });

  it("should return 500 if there was an error", async () => {
    mockedServer.use(errorRoleSearchHandler);
    const event = {
      requestContext: getRequestContext(),
    } as APIGatewayEvent;

    const res = await handler(event);

    expect(res.statusCode).toEqual(500);
    expect(res.body).toEqual(JSON.stringify({ message: "Internal server error" }));
  });
});
