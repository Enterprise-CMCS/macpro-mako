import { APIGatewayEvent, Context } from "aws-lambda";
import {
  errorOnSearchTypeRoleSearchHandler,
  getRequestContext,
  NO_EMAIL_STATE_SUBMITTER_USERNAME,
  setDefaultStateSubmitter,
  setMockUsername,
} from "mocks";
import { mockedServiceServer as mockedServer } from "mocks/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { handler } from "./getApprovers";

describe("getApprovers handler", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    setDefaultStateSubmitter();
    process.env.topicName = "get-approvers";
  });

  it("should return 400, if the event body is missing", async () => {
    const event = {} as APIGatewayEvent;

    const res = await handler(event, {} as Context);

    expect(res.statusCode).toEqual(400);
    expect(res.body).toEqual(JSON.stringify({ message: "Event body required" }));
  });

  it("should return 401, if the user is not authenticated", async () => {
    setMockUsername(null);

    const event = {
      body: JSON.stringify({}),
      requestContext: getRequestContext(),
    } as APIGatewayEvent;

    const res = await handler(event, {} as Context);

    expect(res.statusCode).toEqual(401);
    expect(res.body).toEqual(JSON.stringify({ message: "User is not authenticated" }));
  });

  it("should return 500 if the user does not have an email", async () => {
    setMockUsername(NO_EMAIL_STATE_SUBMITTER_USERNAME);

    const event = {
      body: JSON.stringify({}),
      requestContext: getRequestContext(),
    } as APIGatewayEvent;

    const res = await handler(event, {} as Context);

    expect(res.statusCode).toEqual(500);
    expect(res.body).toEqual(JSON.stringify({ message: "User is invalid" }));
  });

  it("should return 200 and the approver list", async () => {
    const event = {
      body: JSON.stringify({}),
      requestContext: getRequestContext(),
    } as APIGatewayEvent;

    const result = await handler(event, {} as Context);

    expect(result.statusCode).toBe(200);
    expect(result.body).toEqual(
      JSON.stringify({
        message: "Approver list successfully retrieved.",
        approverList: [
          {
            role: "statesubmitter",
            territory: ["VA", "OH", "SC", "CO", "GA", "MD"],
            approvers: [
              {
                id: "statesystemadmin@nightwatch.test_MD_statesystemadmin",
                email: "statesystemadmin@nightwatch.test",
                fullName: "Statesystemadmin Nightwatch",
                territory: "MD",
              },
            ],
          },
        ],
      }),
    );
  });

  it("should return 200 with empty approvers, if getApproversByRole fails for one role", async () => {
    mockedServer.use(errorOnSearchTypeRoleSearchHandler("getApproversByRole"));

    const event = {
      body: JSON.stringify({}),
      requestContext: getRequestContext(),
    } as APIGatewayEvent;

    const res = await handler(event, {} as Context);
    const parsed = JSON.parse(res.body);

    expect(res.statusCode).toEqual(200);
    expect(
      parsed.approverList.some((entry: any) =>
        entry.approvers.some((approver: any) => approver.id === "error"),
      ),
    ).toBe(true);
  });

  it("should return filtered approvers by matching territories", async () => {
    const mockEvent = {
      body: JSON.stringify({}),
      requestContext: getRequestContext(),
    } as APIGatewayEvent;

    const result = await handler(mockEvent, {} as Context);
    console.log("Handler result:", result);
    const parsedBody = JSON.parse(result.body);

    expect(result.statusCode).toBe(200);
    expect(parsedBody.approverList).toHaveLength(1);
  });
});
