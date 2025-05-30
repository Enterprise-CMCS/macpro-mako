import { APIGatewayEvent } from "aws-lambda";
import {
  errorRoleSearchHandler,
  getRequestContext,
  osStateSystemAdmin,
  setDefaultStateSubmitter,
  setMockUsername,
} from "mocks";
import { mockedServiceServer as mockedServer } from "mocks/server";
import { beforeEach, describe, expect, it } from "vitest";

import { handler } from "./getApprovers";

describe("getApprovers handler", () => {
  beforeEach(() => {
    setDefaultStateSubmitter();
    process.env.topicName = "get-approvers";
  });

  it("should return 400 if the request context is missing", async () => {
    const event = {} as APIGatewayEvent;

    const res = await handler(event);

    expect(res.statusCode).toEqual(400);
    expect(res.body).toEqual(JSON.stringify({ message: "Request context required" }));
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

  it("should return 200 and return the approver list", async () => {
    const event = {
      requestContext: getRequestContext(),
    } as APIGatewayEvent;

    const result = await handler(event);

    expect(result.statusCode).toBe(200);
  });

  it("should return 500 if there is an error getting the roles", async () => {
    mockedServer.use(errorRoleSearchHandler);
    setMockUsername(osStateSystemAdmin);
    const event = {
      requestContext: getRequestContext(),
    } as APIGatewayEvent;

    const res = await handler(event);

    expect(res.statusCode).toEqual(500);
    expect(res.body).toEqual(
      JSON.stringify({ message: "Internal server error", error: "Response Error" }),
    );
  });
});
