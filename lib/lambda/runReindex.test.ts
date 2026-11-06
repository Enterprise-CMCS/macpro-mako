import { SFNClient } from "@aws-sdk/client-sfn";
import { afterEach, describe, expect, it, vi } from "vitest";

import { handler } from "./runReindex";

describe("runReindex", () => {
  const mockEventBase = {
    ResourceProperties: {
      stateMachine: "test-state-machine-arn",
    },
  };
  const stepFunctionSpy = vi.spyOn(SFNClient.prototype, "send");

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("starts a state machine execution on Create and returns the execution ARN", async () => {
    stepFunctionSpy.mockResolvedValueOnce({
      executionArn: "arn:aws:states:us-east-1:123:execution:mako:abc",
    } as never);

    const mockEvent = {
      ...mockEventBase,
      RequestType: "Create" as const,
    };

    await expect(handler(mockEvent, {} as never, vi.fn())).resolves.toEqual({
      PhysicalResourceId: "arn:aws:states:us-east-1:123:execution:mako:abc",
      Data: {
        ExecutionArn: "arn:aws:states:us-east-1:123:execution:mako:abc",
      },
    });

    expect(stepFunctionSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        input: {
          input: JSON.stringify({
            cfnEvent: mockEvent,
          }),
          stateMachineArn: "test-state-machine-arn",
        },
      }),
    );
  });

  it("returns the existing physical id on Update", async () => {
    const mockEvent = {
      ...mockEventBase,
      RequestType: "Update" as const,
      PhysicalResourceId: "arn:aws:states:us-east-1:123:execution:mako:abc",
    };

    await expect(handler(mockEvent, {} as never, vi.fn())).resolves.toEqual({
      PhysicalResourceId: "arn:aws:states:us-east-1:123:execution:mako:abc",
    });
    expect(stepFunctionSpy).not.toHaveBeenCalled();
  });

  it("returns the existing physical id on Delete", async () => {
    const mockEvent = {
      ...mockEventBase,
      RequestType: "Delete" as const,
      PhysicalResourceId: "arn:aws:states:us-east-1:123:execution:mako:abc",
    };

    await expect(handler(mockEvent, {} as never, vi.fn())).resolves.toEqual({
      PhysicalResourceId: "arn:aws:states:us-east-1:123:execution:mako:abc",
    });
    expect(stepFunctionSpy).not.toHaveBeenCalled();
  });

  it("propagates StartExecution failures", async () => {
    stepFunctionSpy.mockRejectedValueOnce(new Error("Failed to start"));

    await expect(
      handler(
        {
          ...mockEventBase,
          RequestType: "Create",
        },
        {} as never,
        vi.fn(),
      ),
    ).rejects.toThrow("Failed to start");
  });
});
