import { afterEach, describe, expect, it, vi } from "vitest";
import { handler } from "./deleteTriggers";
import { Context } from "aws-lambda";
import {
  TEST_DELETE_TRIGGER_FUNCTION_NAME,
  TEST_DELETE_TRIGGER_UUID,
  TEST_ERROR_EVENT_SOURCE_FUNCTION_NAME,
  TEST_NO_TRIGGERS_FUNCTION_NAME,
} from "mocks";
import {
  DeleteEventSourceMappingCommand,
  GetEventSourceMappingCommand,
  LambdaClient,
  ListEventSourceMappingsCommand,
} from "@aws-sdk/client-lambda";

describe("Lambda Handler", () => {
  const lambdaSpy = vi.spyOn(LambdaClient.prototype, "send");
  const callback = vi.fn();

  afterEach(() => {
    vi.clearAllMocks();
    vi.useRealTimers();
  });

  it("should handle deleting a trigger", async () => {
    const event = {
      functions: [TEST_DELETE_TRIGGER_FUNCTION_NAME],
    };

    await handler(event, {} as Context, callback);

    expect(lambdaSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        input: {
          FunctionName: TEST_DELETE_TRIGGER_FUNCTION_NAME,
        },
      } as ListEventSourceMappingsCommand),
    );
    expect(lambdaSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        input: {
          UUID: TEST_DELETE_TRIGGER_UUID,
        },
      } as DeleteEventSourceMappingCommand),
    );
    expect(lambdaSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        input: {
          UUID: TEST_DELETE_TRIGGER_UUID,
        },
      } as GetEventSourceMappingCommand),
    );
    expect(lambdaSpy).toHaveBeenCalledTimes(3);
    expect(callback).toHaveBeenCalledWith(null, {
      statusCode: 200,
    });
  });

  it("should handle errors during trigger deletion", async () => {
    const event = {
      functions: [TEST_ERROR_EVENT_SOURCE_FUNCTION_NAME],
    };

    await handler(event, {} as Context, callback);

    expect(lambdaSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        input: {
          FunctionName: TEST_ERROR_EVENT_SOURCE_FUNCTION_NAME,
        },
      } as ListEventSourceMappingsCommand),
    );
    expect(lambdaSpy).toHaveBeenCalledTimes(1);
    expect(callback).toHaveBeenCalledWith(expect.any(Error), {
      statusCode: 500,
    });
  });

  it("should handle no Kafka triggers found for the provided functions", async () => {
    const event = {
      functions: [TEST_NO_TRIGGERS_FUNCTION_NAME],
    };

    await handler(event, {} as Context, callback);

    expect(lambdaSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        input: {
          FunctionName: TEST_NO_TRIGGERS_FUNCTION_NAME,
        },
      } as ListEventSourceMappingsCommand),
    );
    expect(lambdaSpy).toHaveBeenCalledTimes(1);
    expect(callback).toHaveBeenCalledWith(null, { statusCode: 200 });
  });
});
