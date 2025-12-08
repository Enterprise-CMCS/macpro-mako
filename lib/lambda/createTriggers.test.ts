import {
  CreateEventSourceMappingCommand,
  GetEventSourceMappingCommand,
  LambdaClient,
} from "@aws-sdk/client-lambda";
import { Context } from "aws-lambda";
import {
  TEST_ERROR_EVENT_SOURCE_FUNCTION_NAME,
  TEST_FUNCTION_NAME,
  TEST_FUNCTION_TEST_TOPIC_UUID,
  TEST_TOPIC_NAME,
} from "mocks";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { handler } from "./createTriggers";

vi.mock("crypto", () => ({
  randomUUID: vi.fn().mockReturnValue("test-uuid"),
}));

describe("Lambda Handler", () => {
  const lambdaSpy = vi.spyOn(LambdaClient.prototype, "send");
  const callback = vi.fn();

  beforeEach(() => {
    vi.useFakeTimers();
    lambdaSpy.mockImplementation((command) => {
      const input: any = (command as any).input;
      if ((input?.FunctionName || input?.UUID) === TEST_ERROR_EVENT_SOURCE_FUNCTION_NAME) {
        return Promise.reject(new Error("mapping failed"));
      }
      if (input?.UUID) {
        return Promise.resolve({ State: "Enabled" } as any);
      }
      return Promise.resolve({ UUID: TEST_FUNCTION_TEST_TOPIC_UUID } as any);
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
    vi.useRealTimers();
  });

  it("should handle successful execution and enable the mappings", async () => {
    const event = {
      triggers: [
        {
          function: TEST_FUNCTION_NAME,
          topics: [TEST_TOPIC_NAME],
        },
      ],
      consumerGroupPrefix: "cg-",
      brokerString: "broker1,broker2",
      subnets: ["subnet-1", "subnet-2", "subnet-3"],
      securityGroup: "sg-12345678",
    };

    await handler(event, {} as Context, callback);

    expect(lambdaSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        input: expect.objectContaining({
          BatchSize: 1000,
          Enabled: true,
          FunctionName: TEST_FUNCTION_NAME,
          Topics: [TEST_TOPIC_NAME],
        }),
      } as CreateEventSourceMappingCommand),
    );

    expect(lambdaSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        input: {
          UUID: TEST_FUNCTION_TEST_TOPIC_UUID,
        },
      } as GetEventSourceMappingCommand),
    );
    expect(lambdaSpy).toHaveBeenCalledTimes(2);
    expect(callback).toHaveBeenCalledWith(null, { statusCode: 200 });
  });

  it("should handle errors during mapping creation", async () => {
    const event = {
      triggers: [
        {
          function: TEST_ERROR_EVENT_SOURCE_FUNCTION_NAME,
          topics: [TEST_TOPIC_NAME],
        },
      ],
      consumerGroupPrefix: "cg-",
      brokerString: "broker1,broker2",
      subnets: ["subnet-1", "subnet-2", "subnet-3"],
      securityGroup: "sg-12345678",
      startingPosition: "TRIM_HORIZON",
    };

    await handler(event, {} as Context, callback);

    expect(lambdaSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        input: expect.objectContaining({
          BatchSize: 1000,
          Enabled: true,
          FunctionName: TEST_ERROR_EVENT_SOURCE_FUNCTION_NAME,
          Topics: [TEST_TOPIC_NAME],
        }),
      } as CreateEventSourceMappingCommand),
    );
    expect(lambdaSpy).toHaveBeenCalledTimes(1);
    expect(callback).toHaveBeenCalledWith(expect.any(Error), {
      statusCode: 500,
    });
  });
});
