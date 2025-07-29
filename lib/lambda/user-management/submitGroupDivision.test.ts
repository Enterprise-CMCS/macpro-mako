import { APIGatewayEvent, Context } from "aws-lambda";
import {
  CMS_ROLE_APPROVER_USERNAME,
  DEFAULT_CMS_USER_EMAIL,
  DEFAULT_CMS_USER_USERNAME,
  errorRoleSearchHandler,
  getRequestContext,
  setDefaultStateSubmitter,
  setMockUsername,
} from "mocks";
import { mockedProducer } from "mocks/helpers/kafka.utils";
import { mockedServiceServer as mockedServer } from "mocks/server";
import { beforeEach, describe, expect, it } from "vitest";

import { handler } from "./submitGroupDivision";

describe("submitGroupDivision handler", () => {
  beforeEach(() => {
    setDefaultStateSubmitter();
    process.env.topicName = "submit-group-division";
  });

  it("should throw an error if the topicName is not set", async () => {
    delete process.env.topicName;

    const event = {
      body: JSON.stringify({
        userEmail: "mako.stateuser@gmail.com",
        group: "Group1",
        division: "Division1",
      }),
    } as APIGatewayEvent;

    const res = await handler(event, {} as Context);

    expect(res.statusCode).toEqual(500);
    expect(res.body).toEqual(JSON.stringify({ message: "Internal server error" }));
  });

  it("should return a 200 if the group and division were submitted successfully", async () => {
    mockedProducer.send.mockResolvedValueOnce([{ message: "sent" }]);
    setMockUsername(DEFAULT_CMS_USER_USERNAME);

    const event = {
      body: JSON.stringify({
        userEmail: DEFAULT_CMS_USER_EMAIL,
        group: "Group1",
        division: "Division1",
      }),
      requestContext: getRequestContext(),
    } as APIGatewayEvent;

    const res = await handler(event, {} as Context);

    expect(res.statusCode).toEqual(200);
    expect(res.body).toEqual(
      JSON.stringify({ message: "Group and division submitted successfully." }),
    );
  });

  it("should return a 200 if the user is a manager", async () => {
    mockedProducer.send.mockResolvedValueOnce([{ message: "sent" }]);
    setMockUsername(CMS_ROLE_APPROVER_USERNAME);

    const event = {
      body: JSON.stringify({
        userEmail: DEFAULT_CMS_USER_EMAIL,
        group: "Group1",
        division: "Division1",
      }),
      requestContext: getRequestContext(),
    } as APIGatewayEvent;

    const res = await handler(event, {} as Context);

    expect(res.statusCode).toEqual(200);
    expect(res.body).toEqual(
      JSON.stringify({ message: "Group and division submitted successfully." }),
    );
  });

  it("should return a 404 if the user is not found", async () => {
    setMockUsername(CMS_ROLE_APPROVER_USERNAME);

    const event = {
      body: JSON.stringify({
        userEmail: "test@test.com",
        group: "Group1",
        division: "Division1",
      }),
      requestContext: getRequestContext(),
    };

    const res = await handler(event, {} as Context);

    expect(res.statusCode).toEqual(404);
    expect(res.body).toEqual(
      JSON.stringify({ message: "User with email test@test.com not found." }),
    );
  });

  it("should return a 400 if the event body is missing", async () => {
    const event = {};

    const res = await handler(event, {} as Context);

    expect(res.statusCode).toEqual(400);
    expect(res.body).toEqual(JSON.stringify({ message: "Event body required" }));
  });

  it("should return a 500 if there is an error", async () => {
    mockedServer.use(errorRoleSearchHandler);
    setMockUsername(DEFAULT_CMS_USER_USERNAME);

    const event = {
      body: JSON.stringify({
        userEmail: DEFAULT_CMS_USER_EMAIL,
        group: "Group1",
        division: "Division1",
      }),
      requestContext: getRequestContext(),
    } as APIGatewayEvent;

    const res = await handler(event, {} as Context);

    expect(res.statusCode).toEqual(500);
    expect(res.body).toContain("Internal server error");
  });
});
