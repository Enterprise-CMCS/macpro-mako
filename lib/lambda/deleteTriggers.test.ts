import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { handler } from "./deleteTriggers";
import {
  LambdaClient,
  ListEventSourceMappingsCommand,
  DeleteEventSourceMappingCommand,
} from "@aws-sdk/client-lambda";

vi.mock("@aws-sdk/client-lambda", () => ({
  LambdaClient: vi.fn().mockImplementation(() => ({
    send: vi.fn(),
  })),
  ListEventSourceMappingsCommand: vi.fn(),
  DeleteEventSourceMappingCommand: vi.fn(),
  GetEventSourceMappingCommand: vi.fn(),
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

  it("should handle errors during trigger deletion", async () => {
    const event = {
      functions: ["function1"],
    };

    mockLambdaClientSend
      .mockResolvedValueOnce({
        EventSourceMappings: [{ UUID: "uuid-1", SelfManagedKafkaEventSourceConfig: {} }],
      })
      .mockRejectedValueOnce(new Error("Test error"));

    await handler(event, null, callback);

    expect(mockLambdaClientSend).toHaveBeenCalledWith(expect.any(ListEventSourceMappingsCommand));
    expect(mockLambdaClientSend).toHaveBeenCalledWith(expect.any(DeleteEventSourceMappingCommand));
    expect(callback).toHaveBeenCalledWith(expect.any(Error), {
      statusCode: 500,
    });
  });

  it("should handle no Kafka triggers found for the provided functions", async () => {
    const event = {
      functions: ["function1"],
    };

    mockLambdaClientSend.mockResolvedValueOnce({
      EventSourceMappings: [],
    });

    await handler(event, null, callback);

    expect(mockLambdaClientSend).toHaveBeenCalledWith(expect.any(ListEventSourceMappingsCommand));
    expect(callback).toHaveBeenCalledWith(null, { statusCode: 200 });
  });
});
