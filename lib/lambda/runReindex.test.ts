import { describe, it, expect, vi, afterEach } from "vitest";
import { handler } from "./runReindex";
import { Context } from "aws-lambda";
import { CLOUDFORMATION_NOTIFICATION_DOMAIN } from "mocks";
import { SFNClient } from "@aws-sdk/client-sfn";
import * as cfn from "cfn-response-async";

describe("CloudFormation Custom Resource Handler", () => {
  const mockEventBase = {
    ResponseURL: CLOUDFORMATION_NOTIFICATION_DOMAIN,
    ResourceProperties: {
      stateMachine: "test-state-machine-arn",
    },
  };
  const stepFunctionSpy = vi.spyOn(SFNClient.prototype, "send");
  const cfnSpy = vi.spyOn(cfn, "send");
  const callback = vi.fn();

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("should start a state machine execution on Create request type", async () => {
    const mockEvent = {
      ...mockEventBase,
      RequestType: "Create",
    };

    await handler(mockEvent, {} as Context, callback);

    expect(stepFunctionSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        input: {
          input: JSON.stringify({
            cfnEvent: mockEvent,
            cfnContext: {},
          }),
          stateMachineArn: "test-state-machine-arn",
        },
      }),
    );
    expect(cfnSpy).not.toHaveBeenCalled();
    expect(callback).toHaveBeenCalledWith(null, { statusCode: 200 });
  });

  it("should send a SUCCESS response on Update request type", async () => {
    const mockEvent = {
      ...mockEventBase,
      RequestType: "Update",
    };

    await handler(mockEvent, {} as Context, callback);

    expect(stepFunctionSpy).not.toHaveBeenCalled();
    expect(cfnSpy).toHaveBeenCalledWith(mockEvent, {}, cfn.SUCCESS);
    expect(callback).toHaveBeenCalledWith(null, { statusCode: 200 });
  });

  it("should send a SUCCESS response on Delete request type", async () => {
    const mockEvent = {
      ...mockEventBase,
      RequestType: "Delete",
    };

    await handler(mockEvent, {} as Context, callback);

    expect(stepFunctionSpy).not.toHaveBeenCalled();
    expect(cfnSpy).toHaveBeenCalledWith(mockEvent, {}, cfn.SUCCESS);
    expect(callback).toHaveBeenCalledWith(null, { statusCode: 200 });
  });

  it("should send a FAILED response on error", async () => {
    const mockEvent = {
      ...mockEventBase,
      RequestType: "Create",
      ResourceProperties: {
        stateMachine: "error-test-state-machine-arn",
      },
    };

    await handler(mockEvent, {} as Context, callback);

    expect(stepFunctionSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        input: {
          input: JSON.stringify({
            cfnEvent: mockEvent,
            cfnContext: {},
          }),
          stateMachineArn: "error-test-state-machine-arn",
        },
      }),
    );
    expect(cfnSpy).toHaveBeenCalledWith(mockEvent, {}, cfn.FAILED);
    expect(callback).toHaveBeenCalledWith(expect.any(Error), { statusCode: 500 });
  });
});
