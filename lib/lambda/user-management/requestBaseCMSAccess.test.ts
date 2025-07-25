import { APIGatewayEvent, Context } from "aws-lambda";
import {
  automatedHelpDeskUser,
  automatedReviewer,
  coStateSubmitter,
  errorRoleSearchHandler,
  getRequestContext,
  setDefaultStateSubmitter,
  setMockUsername,
} from "mocks";
import { mockedProducer } from "mocks/helpers/kafka.utils";
import { mockedServiceServer as mockedServer } from "mocks/server";
import { beforeEach, describe, expect, it } from "vitest";

import { handler } from "./requestBaseCMSAccess";

describe("requestBaseCMSAccess handler", () => {
  beforeEach(() => {
    setDefaultStateSubmitter();
    process.env.topicName = "request-cms-access";
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

  it("should return 401 if the request context is missing", async () => {
    const event = {
      body: JSON.stringify({}),
    } as APIGatewayEvent;

    const res = await handler(event, {} as Context);

    expect(res.statusCode).toEqual(401);
    expect(res.body).toEqual(JSON.stringify({ message: "User is not authenticated" }));
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

  it("should return 200 if user has roles", async () => {
    const event = {
      body: JSON.stringify({}),
      requestContext: getRequestContext(),
    } as APIGatewayEvent;

    const res = await handler(event, {} as Context);

    expect(res.statusCode).toEqual(200);
    expect(res.body).toEqual(JSON.stringify({ message: "User roles already created" }));
  });

  it("should return 200 if a CMS user does not have roles", async () => {
    mockedProducer.send.mockResolvedValueOnce([{ message: "sent" }]);
    setMockUsername(automatedReviewer);

    const event = {
      body: JSON.stringify({}),
      requestContext: getRequestContext(),
    } as APIGatewayEvent;

    const res = await handler(event, {} as Context);

    expect(res.statusCode).toEqual(200);
    expect(res.body).toEqual(
      JSON.stringify({ message: "User role updated, because no default role found" }),
    );
  });

  it("should return 200 if a CMS help desk user does not have roles", async () => {
    mockedProducer.send.mockResolvedValueOnce([{ message: "sent" }]);
    setMockUsername(automatedHelpDeskUser);

    const event = {
      body: JSON.stringify({}),
      requestContext: getRequestContext(),
    } as APIGatewayEvent;

    const res = await handler(event, {} as Context);

    expect(res.statusCode).toEqual(200);
    expect(res.body).toEqual(
      JSON.stringify({ message: "User role updated, because no default role found" }),
    );
  });

  it("should return 200 if a state user does not have roles", async () => {
    setMockUsername(coStateSubmitter);

    const event = {
      body: JSON.stringify({}),
      requestContext: getRequestContext(),
    } as APIGatewayEvent;

    const res = await handler(event, {} as Context);

    expect(res.statusCode).toEqual(200);
    expect(res.body).toEqual(JSON.stringify({ message: "User role not updated" }));
  });

  it("should return 500 if there was an error", async () => {
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
