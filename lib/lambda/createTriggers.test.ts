import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { handler } from "./createTriggers";
import {
  LambdaClient,
  CreateEventSourceMappingCommand,
  GetEventSourceMappingCommand,
} from "@aws-sdk/client-lambda";

vi.mock("@aws-sdk/client-lambda", () => ({
  LambdaClient: vi.fn().mockImplementation(() => ({
    send: vi.fn(),
  })),
  CreateEventSourceMappingCommand: vi.fn(),
  GetEventSourceMappingCommand: vi.fn(),
}));

vi.mock("crypto", () => ({
  randomUUID: vi.fn().mockReturnValue("test-uuid"),
}));

describe("Lambda Handler", () => {
  const callback = vi.fn();
  const mockLambdaClientSend = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    (LambdaClient as any).mockImplementation(() => ({
      send: mockLambdaClientSend,
    }));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("should handle successful execution and enable the mappings", async () => {
    const event = {
      triggers: [
        {
          function: "test-function",
          topics: ["test-topic"],
        },
      ],
      consumerGroupPrefix: "cg-",
      brokerString: "broker1,broker2",
      subnets: ["subnet-1", "subnet-2", "subnet-3"],
      securityGroup: "sg-12345678",
      startingPosition: "TRIM_HORIZON",
    };

    mockLambdaClientSend
      .mockResolvedValueOnce({ UUID: "uuid-1" }) // Response for CreateEventSourceMappingCommand
      .mockResolvedValueOnce({ State: "Enabled" }); // Response for GetEventSourceMappingCommand

    await handler(event, null, callback);

    expect(mockLambdaClientSend).toHaveBeenCalledWith(expect.any(CreateEventSourceMappingCommand));
    expect(mockLambdaClientSend).toHaveBeenCalledWith(expect.any(GetEventSourceMappingCommand));
    expect(callback).toHaveBeenCalledWith(null, { statusCode: 200 });
  });

  it("should handle errors during mapping creation", async () => {
    const event = {
      triggers: [
        {
          function: "test-function",
          topics: ["test-topic"],
        },
      ],
      consumerGroupPrefix: "cg-",
      brokerString: "broker1,broker2",
      subnets: ["subnet-1", "subnet-2", "subnet-3"],
      securityGroup: "sg-12345678",
      startingPosition: "TRIM_HORIZON",
    };

    mockLambdaClientSend.mockRejectedValueOnce(new Error("Test error"));

    await handler(event, null, callback);

    expect(mockLambdaClientSend).toHaveBeenCalledWith(expect.any(CreateEventSourceMappingCommand));
    expect(callback).toHaveBeenCalledWith(expect.any(Error), {
      statusCode: 500,
    });
  });
});
