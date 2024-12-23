import { describe, it, expect, vi, Mock, beforeEach } from "vitest";
import { handler } from "./cfnNotify";
import { send, SUCCESS, FAILED } from "cfn-response-async";
import { Context } from "aws-lambda";

vi.mock("cfn-response-async", () => ({
  send: vi.fn(),
  SUCCESS: "SUCCESS",
  FAILED: "FAILED",
}));

describe("Lambda Handler", () => {
  const callback = vi.fn();
  const mockContext: Context = {
    callbackWaitsForEmptyEventLoop: true,
    functionName: "test",
    functionVersion: "1",
    invokedFunctionArn: "arn:test",
    memoryLimitInMB: "128",
    awsRequestId: "test-id",
    logGroupName: "test-group",
    logStreamName: "test-stream",
    getRemainingTimeInMillis: () => 1000,
    done: () => {},
    fail: () => {},
    succeed: () => {},
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should send SUCCESS notification when event.Success is true", async () => {
    const event = {
      Success: true,
      Context: {
        Execution: {
          Input: {
            cfnEvent: {},
            cfnContext: {},
          },
        },
      },
    };

    await handler(event, mockContext, callback);

    expect(send).toHaveBeenCalledWith(
      event.Context.Execution.Input.cfnEvent,
      event.Context.Execution.Input.cfnContext,
      SUCCESS,
      {},
      "static",
    );
    expect(callback).toHaveBeenCalledWith(null, { statusCode: 200 });
  });

  it("should send FAILED notification when event.Success is false", async () => {
    const event = {
      Success: false,
      Context: {
        Execution: {
          Input: {
            cfnEvent: {},
            cfnContext: {},
          },
        },
      },
    };

    await handler(event, mockContext, callback);

    expect(send).toHaveBeenCalledWith(
      event.Context.Execution.Input.cfnEvent,
      event.Context.Execution.Input.cfnContext,
      FAILED,
      {},
      "static",
    );
    expect(callback).toHaveBeenCalledWith(null, { statusCode: 200 });
  });

  it("should proceed without notification when cfnEvent is missing", async () => {
    const event = {
      Success: true,
      Context: {
        Execution: {
          Input: {
            cfnEvent: null,
            cfnContext: {},
          },
        },
      },
    };

    await handler(event, mockContext, callback);

    expect(send).not.toHaveBeenCalled();
    expect(callback).toHaveBeenCalledWith(null, { statusCode: 200 });
  });

  it("should handle errors and return statusCode 500", async () => {
    const event = {
      Success: true,
      Context: {
        Execution: {
          Input: {
            cfnEvent: {},
            cfnContext: {},
          },
        },
      },
    };

    // Simulate an error in send function
    (send as Mock).mockRejectedValue(new Error("Test error"));

    await handler(event, mockContext, callback);

    expect(callback).toHaveBeenCalledWith(expect.any(Error), {
      statusCode: 500,
    });
  });
});
