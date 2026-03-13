import { SFNClient } from "@aws-sdk/client-sfn";
import { SQSClient } from "@aws-sdk/client-sqs";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { handler } from "./attachmentArchiveBackfillStatus";

describe("attachmentArchiveBackfillStatus handler", () => {
  const originalQueueUrl = process.env.ATTACHMENT_ARCHIVE_REBUILD_QUEUE_URL;
  const originalStateMachineArn = process.env.ATTACHMENT_ARCHIVE_STATE_MACHINE_ARN;
  const sqsSpy = vi.spyOn(SQSClient.prototype, "send");
  const stepFunctionsSpy = vi.spyOn(SFNClient.prototype, "send");

  beforeEach(() => {
    process.env.ATTACHMENT_ARCHIVE_REBUILD_QUEUE_URL =
      "https://sqs.us-east-1.amazonaws.com/123456789012/test-queue.fifo";
    process.env.ATTACHMENT_ARCHIVE_STATE_MACHINE_ARN =
      "arn:aws:states:us-east-1:123456789012:stateMachine:attachment-archive";
  });

  afterEach(() => {
    sqsSpy.mockReset();
    stepFunctionsSpy.mockReset();
    process.env.ATTACHMENT_ARCHIVE_REBUILD_QUEUE_URL = originalQueueUrl;
    process.env.ATTACHMENT_ARCHIVE_STATE_MACHINE_ARN = originalStateMachineArn;
  });

  it("returns queue depth and running execution counts while excluding the current historical execution", async () => {
    sqsSpy.mockResolvedValue({
      Attributes: {
        ApproximateNumberOfMessages: "2",
        ApproximateNumberOfMessagesNotVisible: "3",
      },
    } as never);
    stepFunctionsSpy
      .mockResolvedValueOnce({
        executions: [
          {
            executionArn: "arn:aws:states:us-east-1:123456789012:execution:attachment-archive:1",
          },
        ],
      } as never)
      .mockResolvedValueOnce({
        executions: [
          {
            executionArn:
              "arn:aws:states:us-east-1:123456789012:execution:historical-backfill:current",
          },
          {
            executionArn:
              "arn:aws:states:us-east-1:123456789012:execution:historical-backfill:other",
          },
        ],
      } as never);

    const result = await handler({
      currentExecutionArn:
        "arn:aws:states:us-east-1:123456789012:execution:historical-backfill:current",
      historicalBackfillStateMachineArn:
        "arn:aws:states:us-east-1:123456789012:stateMachine:historical-backfill",
    });

    expect(result).toEqual({
      otherHistoricalBackfillExecutions: 1,
      queueInflight: 3,
      queueVisible: 2,
      runningExecutions: 1,
    });
    expect(sqsSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        input: expect.objectContaining({
          AttributeNames: ["ApproximateNumberOfMessages", "ApproximateNumberOfMessagesNotVisible"],
          QueueUrl: "https://sqs.us-east-1.amazonaws.com/123456789012/test-queue.fifo",
        }),
      }),
    );
    expect(stepFunctionsSpy).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({
        input: expect.objectContaining({
          stateMachineArn: "arn:aws:states:us-east-1:123456789012:stateMachine:attachment-archive",
          statusFilter: "RUNNING",
        }),
      }),
    );
    expect(stepFunctionsSpy).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({
        input: expect.objectContaining({
          stateMachineArn: "arn:aws:states:us-east-1:123456789012:stateMachine:historical-backfill",
          statusFilter: "RUNNING",
        }),
      }),
    );
  });
});
