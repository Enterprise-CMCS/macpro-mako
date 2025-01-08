import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { handler } from "./createTriggers";
import { Context } from "aws-lambda";
import {
  TEST_ERROR_EVENT_SOURCE_FUNCTION_NAME,
  TEST_FUNCTION_NAME,
  TEST_TOPIC_NAME,
  TEST_FUNCTION_TEST_TOPIC_UUID,
} from "mocks";
import {
  LambdaClient,
  CreateEventSourceMappingCommand,
  GetEventSourceMappingCommand,
} from "@aws-sdk/client-lambda";

vi.mock("crypto", () => ({
  randomUUID: vi.fn().mockReturnValue("test-uuid"),
}));

describe("Lambda Handler", () => {
  const lambdaSpy = vi.spyOn(LambdaClient.prototype, "send");
  const callback = vi.fn();

  beforeEach(() => {
    vi.useFakeTimers();
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
      startingPosition: "TRIM_HORIZON",
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
