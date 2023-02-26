import { it, describe, expect, vi, beforeEach } from "vitest";
import { CloudWatch } from "@aws-sdk/client-cloudwatch";
import type {
  APIGatewayEvent,
  APIGatewayProxyCallback,
  Context,
} from "aws-lambda";
import { handler, replaceStringValues } from "../templatizeCloudWatchDashboard";

// Mock the CloudWatch client
vi.mock("@aws-sdk/client-cloudwatch", () => ({
  CloudWatch: vi.fn().mockImplementation(() => ({
    getDashboard: vi.fn().mockResolvedValue({
      DashboardBody: "test-dashboard-body",
    }),
  })),
}));

describe("replaceStringValues", () => {
  it("replaces string with correct values", () => {
    const string = "hello jim";
    const replacables = { hello: "world", jim: "wally" };
    const response = replaceStringValues(string, replacables);
    expect(response).toBe("world wally");
  });

  it("should handle empty string", () => {
    const string = "";
    const replacables = { name: "Alice" };
    expect(replaceStringValues(string, replacables)).toBe("");
  });
});

describe("handler", () => {
  const mockEvent: APIGatewayEvent = {} as APIGatewayEvent;
  const mockContext: Context = {} as Context;
  const mockCallback: APIGatewayProxyCallback = {} as APIGatewayProxyCallback;

  beforeEach(() => {
    vi.clearAllMocks();
    process.env.service = "test-service";
    process.env.accountId = "test-account-id";
    process.env.stage = "test-stage";
    process.env.region = "test-region";
  });

  it("should return the replaced dashboard body", async () => {
    const result = await handler(mockEvent, mockContext, mockCallback);
    expect(result).toBe("test-dashboard-body");
    expect(CloudWatch).toHaveBeenCalledTimes(1);
    expect(CloudWatch).toHaveBeenCalledWith({});
    // expect(CloudWatch.getDashboard).toHaveBeenCalledTimes(1);
    // expect(CloudWatch.prototype.getDashboard).toHaveBeenCalledWith({
    //   DashboardName: "test-stage-dashboard",
    // });
  });
});
