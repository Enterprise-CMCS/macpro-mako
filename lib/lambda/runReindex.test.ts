import { describe, it, expect, vi, beforeEach } from "vitest";
import { send, SUCCESS, FAILED } from "cfn-response-async";
import { SFNClient, StartExecutionCommand } from "@aws-sdk/client-sfn";
import { handler } from "./runReindex";
import { Context } from "aws-lambda";

vi.mock("cfn-response-async", () => ({
  send: vi.fn(),
  SUCCESS: "SUCCESS",
  FAILED: "FAILED",
}));

vi.mock("@aws-sdk/client-sfn", () => ({
  SFNClient: vi.fn().mockImplementation(() => ({
    send: vi.fn(),
  })),
  StartExecutionCommand: vi.fn(),
}));

describe("CloudFormation Custom Resource Handler", () => {
  const mockContext = {};
  const mockEventBase = {
    ResourceProperties: {
      stateMachine: "test-state-machine-arn",
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should start a state machine execution on Create request type", async () => {
    const mockEvent = {
      ...mockEventBase,
      RequestType: "Create",
    };

    const startExecutionResponse = {
      executionArn: "test-execution-arn",
    };

    const sendMock = vi.fn().mockResolvedValue(startExecutionResponse);
    (SFNClient as any).mockImplementationOnce(() => ({
      send: sendMock,
    }));

    await handler(mockEvent, {} as Context, () => {});

    expect(SFNClient).toHaveBeenCalled();
    expect(StartExecutionCommand).toHaveBeenCalledWith({
      stateMachineArn: "test-state-machine-arn",
      input: JSON.stringify({
        cfnEvent: mockEvent,
        cfnContext: mockContext,
      }),
    });
    expect(sendMock).toHaveBeenCalled();
    expect(send).not.toHaveBeenCalledWith(mockEvent, mockContext, SUCCESS, {}, "static");
  });

  it("should send a SUCCESS response on Update request type", async () => {
    const mockEvent = {
      ...mockEventBase,
      RequestType: "Update",
    };

    await handler(mockEvent, {} as Context, () => {});

    expect(send).toHaveBeenCalledWith(mockEvent, mockContext, SUCCESS, {}, "static");
  });

  it("should send a SUCCESS response on Delete request type", async () => {
    const mockEvent = {
      ...mockEventBase,
      RequestType: "Delete",
    };

    await handler(mockEvent, {} as Context, () => {});

    expect(send).toHaveBeenCalledWith(mockEvent, mockContext, SUCCESS, {}, "static");
  });

  it("should send a FAILED response on error", async () => {
    const mockEvent = {
      ...mockEventBase,
      RequestType: "Create",
    };

    const sendMock = vi.fn().mockRejectedValue(new Error("Test error"));
    (SFNClient as any).mockImplementationOnce(() => ({
      send: sendMock,
    }));

    await handler(mockEvent, {} as Context, () => {});

    expect(send).toHaveBeenCalledWith(mockEvent, mockContext, FAILED, {}, "static");
  });
});
