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

  /**
   * Happy-path behavior:
   *  - First send(): CreateEventSourceMappingCommand -> returns UUID
   *  - Second send(): GetEventSourceMappingCommand  -> returns State: "Enabled"
   */
  const mockSuccessMapping = () => {
    // First call: CreateEventSourceMappingCommand
    lambdaSpy.mockImplementationOnce(async (command) => {
      // Optional sanity check, safe to remove if noisy:
      // expect(command).toBeInstanceOf(CreateEventSourceMappingCommand);
      return { UUID: TEST_FUNCTION_TEST_TOPIC_UUID } as any;
    });

    // Second call: GetEventSourceMappingCommand
    lambdaSpy.mockImplementationOnce(async (command) => {
      // Optional sanity check:
      // expect(command).toBeInstanceOf(GetEventSourceMappingCommand);
      return { State: "Enabled" } as any;
    });
  };

  /**
   * Error behavior:
   *  - First send(): CreateEventSourceMappingCommand -> throws
   * This drives your handler into the catch block and makes it call
   * the callback with an Error and statusCode: 500.
   */
  const mockErrorOnCreate = () => {
    lambdaSpy.mockImplementationOnce(async () => {
      throw new Error("Mapping creation failed");
    });
  };

  beforeEach(() => {
    lambdaSpy.mockReset();
    callback.mockReset();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("should handle successful execution and enable the mappings", async () => {
    mockSuccessMapping();

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
    mockErrorOnCreate();

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
