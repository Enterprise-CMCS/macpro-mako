import { Context } from "aws-lambda";
import * as cfn from "cfn-response-async";
import { CLOUDFORMATION_NOTIFICATION_DOMAIN } from "mocks";
import { afterEach, describe, expect, it, vi } from "vitest";

import { handler } from "./cfnNotify";

describe("Lambda Handler", () => {
  const cfnSpy = vi.spyOn(cfn, "send");
  const callback = vi.fn();

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("should send SUCCESS notification when event.Success is true", async () => {
    const event = {
      Success: true,
      Context: {
        Execution: {
          Input: {
            cfnEvent: {
              ResponseURL: CLOUDFORMATION_NOTIFICATION_DOMAIN,
            },
            cfnContext: {},
          },
        },
      },
    };

    await handler(event, {} as Context, callback);

    expect(cfnSpy).toHaveBeenCalledWith(
      event.Context.Execution.Input.cfnEvent,
      event.Context.Execution.Input.cfnContext,
      cfn.SUCCESS,
      {},
      "static",
    );
    expect(callback).toHaveBeenCalledWith(null, { statusCode: 200 });
  });

  it("should send FAILED notification when event.Success is false", async () => {
    const event = {
      Success: false,
      Context: {
        Execution: {
          Input: {
            cfnEvent: {
              ResponseURL: CLOUDFORMATION_NOTIFICATION_DOMAIN,
            },
            cfnContext: {},
          },
        },
      },
    };

    await handler(event, {} as Context, callback);

    expect(cfnSpy).toHaveBeenCalledWith(
      event.Context.Execution.Input.cfnEvent,
      event.Context.Execution.Input.cfnContext,
      cfn.FAILED,
      {},
      "static",
    );
    expect(callback).toHaveBeenCalledWith(null, { statusCode: 200 });
  });

  it("should proceed without notification when cfnEvent is missing", async () => {
    const event = {
      Success: true,
      Context: {
        Execution: {
          Input: {
            cfnEvent: null,
            cfnContext: {},
          },
        },
      },
    };

    await handler(event, {} as Context, callback);

    expect(cfnSpy).not.toHaveBeenCalled();
    expect(callback).toHaveBeenCalledWith(null, { statusCode: 200 });
  });

  it("should handle errors and return statusCode 500", async () => {
    const event = {
      Success: true,
      Context: {},
    };

    await handler(event, {} as Context, callback);

    expect(callback).toHaveBeenCalledWith(expect.any(Error), {
      statusCode: 500,
    });
  });
});
