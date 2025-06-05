import { APIGatewayEvent } from "aws-lambda";
import {
  coStateSubmitter,
  getRequestContext,
  setDefaultStateSubmitter,
  setMockUsername,
  stateSubmitter,
} from "mocks";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { handler } from "./getApprovers";
import { getAllUserRolesByEmail, getApproversByRole } from "./userManagementService";

vi.mock("./userManagementService", () => ({
  getApproversByRole: vi.fn(),
  getAllUserRolesByEmail: vi.fn(),
}));

describe("getApprovers handler", () => {
  beforeEach(() => {
    vi.resetAllMocks();
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
    console.log("RESULT", result);

    expect(result.statusCode).toBe(200);
  });

  it("should return 200 with empty approvers if getApproversByRole fails for one role", async () => {
    (getApproversByRole as any).mockRejectedValue(new Error("Oops"));

    setMockUsername(stateSubmitter);

    const event = {
      requestContext: getRequestContext(),
    } as APIGatewayEvent;

    const res = await handler(event);
    const parsed = JSON.parse(res.body);

    expect(res.statusCode).toEqual(200);
    expect(parsed.approverList.every((entry: any) => entry.approvers.length === 0)).toBe(true);
  });

  it("should return filtered approvers by matching territories", async () => {
    (getApproversByRole as any).mockImplementation(async () => {
      return [
        { fullName: "Jane", role: "statesubmitter", territory: "CA" },
        { fullName: "John", role: "statesubmitter", territory: "CO" },
      ];
    });

    (getAllUserRolesByEmail as any).mockImplementation(async () => {
      return [{ role: "statesubmitter", territory: "CO" }];
    });

    setMockUsername(coStateSubmitter);

    const mockEvent = {
      requestContext: getRequestContext(),
    } as APIGatewayEvent;

    const result = await handler(mockEvent);
    console.log("Handler result:", result);
    const parsedBody = JSON.parse(result.body);

    expect(result.statusCode).toBe(200);
    expect(parsedBody.approverList).toEqual([
      {
        approvers: [
          {
            fullName: "John",
            role: "statesubmitter",
            territory: "CO",
          },
        ],
        role: "statesubmitter",
        territory: ["CO"],
      },
    ]);
  });
});
