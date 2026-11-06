import { SFNClient } from "@aws-sdk/client-sfn";
import { afterEach, describe, expect, it, vi } from "vitest";

import { handler } from "./checkReindexComplete";

describe("checkReindexComplete", () => {
  const stepFunctionSpy = vi.spyOn(SFNClient.prototype, "send");

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("returns complete immediately for Update", async () => {
    await expect(
      handler(
        {
          RequestType: "Update",
          PhysicalResourceId: "arn:aws:states:us-east-1:123:execution:mako:abc",
        },
        {} as never,
        vi.fn(),
      ),
    ).resolves.toEqual({ IsComplete: true });
    expect(stepFunctionSpy).not.toHaveBeenCalled();
  });

  it("returns complete immediately for Delete", async () => {
    await expect(
      handler(
        {
          RequestType: "Delete",
          PhysicalResourceId: "arn:aws:states:us-east-1:123:execution:mako:abc",
        },
        {} as never,
        vi.fn(),
      ),
    ).resolves.toEqual({ IsComplete: true });
    expect(stepFunctionSpy).not.toHaveBeenCalled();
  });

  it("returns incomplete while the execution is running", async () => {
    stepFunctionSpy.mockResolvedValueOnce({
      status: "RUNNING",
      startDate: new Date(),
    } as never);

    await expect(
      handler(
        {
          RequestType: "Create",
          PhysicalResourceId: "arn:aws:states:us-east-1:123:execution:mako:abc",
          Data: { ExecutionArn: "arn:aws:states:us-east-1:123:execution:mako:abc" },
        },
        {} as never,
        vi.fn(),
      ),
    ).resolves.toEqual({ IsComplete: false });
  });

  it("hands off long-running executions before the provider timeout", async () => {
    stepFunctionSpy.mockResolvedValueOnce({
      status: "RUNNING",
      startDate: new Date(Date.now() - 46 * 60 * 1000),
    } as never);

    await expect(
      handler(
        {
          RequestType: "Create",
          PhysicalResourceId: "arn:aws:states:us-east-1:123:execution:mako:abc",
          Data: { ExecutionArn: "arn:aws:states:us-east-1:123:execution:mako:abc" },
        },
        {} as never,
        vi.fn(),
      ),
    ).resolves.toEqual({
      IsComplete: true,
      Data: {
        ExecutionArn: "arn:aws:states:us-east-1:123:execution:mako:abc",
        Status: "RUNNING",
        HandedOff: true,
      },
    });
  });

  it("returns complete when the execution succeeded", async () => {
    stepFunctionSpy.mockResolvedValueOnce({ status: "SUCCEEDED" } as never);

    await expect(
      handler(
        {
          RequestType: "Create",
          PhysicalResourceId: "arn:aws:states:us-east-1:123:execution:mako:abc",
          Data: { ExecutionArn: "arn:aws:states:us-east-1:123:execution:mako:abc" },
        },
        {} as never,
        vi.fn(),
      ),
    ).resolves.toEqual({
      IsComplete: true,
      Data: {
        ExecutionArn: "arn:aws:states:us-east-1:123:execution:mako:abc",
        Status: "SUCCEEDED",
      },
    });
  });

  it("throws when the execution failed", async () => {
    stepFunctionSpy.mockResolvedValueOnce({
      status: "FAILED",
      error: "States.Runtime",
      cause: "history event limit",
    } as never);

    await expect(
      handler(
        {
          RequestType: "Create",
          PhysicalResourceId: "arn:aws:states:us-east-1:123:execution:mako:abc",
          Data: { ExecutionArn: "arn:aws:states:us-east-1:123:execution:mako:abc" },
        },
        {} as never,
        vi.fn(),
      ),
    ).rejects.toThrow(/ended with status FAILED/);
  });

  it("throws when Create is missing an execution ARN", async () => {
    await expect(
      handler(
        {
          RequestType: "Create",
          PhysicalResourceId: "static",
        },
        {} as never,
        vi.fn(),
      ),
    ).rejects.toThrow(/Missing reindex execution ARN/);
  });
});
