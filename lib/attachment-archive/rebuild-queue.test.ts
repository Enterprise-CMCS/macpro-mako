import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const { send } = vi.hoisted(() => ({
  send: vi.fn(),
}));

vi.mock("@aws-sdk/client-sqs", () => ({
  SendMessageCommand: class SendMessageCommand {
    input: Record<string, unknown>;

    constructor(input: Record<string, unknown>) {
      this.input = input;
    }
  },
  SQSClient: class SQSClient {
    send = send;
  },
}));

import {
  buildAttachmentArchiveMessageGroupId,
  sendAttachmentArchiveRebuildRequest,
  sendAttachmentArchiveRetryRequest,
} from "./rebuild-queue";

describe("attachment archive rebuild queue", () => {
  const originalQueueUrl = process.env.ATTACHMENT_ARCHIVE_REBUILD_QUEUE_URL;
  const originalRetryQueueUrl = process.env.ATTACHMENT_ARCHIVE_RETRY_QUEUE_URL;

  beforeEach(() => {
    process.env.ATTACHMENT_ARCHIVE_REBUILD_QUEUE_URL =
      "https://sqs.us-east-1.amazonaws.com/123456789012/archive-rebuild.fifo";
    process.env.ATTACHMENT_ARCHIVE_RETRY_QUEUE_URL =
      "https://sqs.us-east-1.amazonaws.com/123456789012/archive-retry.fifo";
    send.mockResolvedValue({});
  });

  afterEach(() => {
    process.env.ATTACHMENT_ARCHIVE_REBUILD_QUEUE_URL = originalQueueUrl;
    process.env.ATTACHMENT_ARCHIVE_RETRY_QUEUE_URL = originalRetryQueueUrl;
    send.mockReset();
  });

  it("builds a stable fifo-compatible message group id", () => {
    const packageId = "CA-22-2020-hjfg TEST";
    const groupId = buildAttachmentArchiveMessageGroupId(packageId);

    expect(groupId).toMatch(/^package-[a-f0-9]{64}$/);
    expect(groupId.length).toBeLessThanOrEqual(128);
    expect(groupId).toBe(buildAttachmentArchiveMessageGroupId(packageId));
  });

  it("builds distinct group ids for distinct package ids", () => {
    expect(buildAttachmentArchiveMessageGroupId("MD-1")).not.toBe(
      buildAttachmentArchiveMessageGroupId("MD-2"),
    );
  });

  it("builds distinct group ids for draft and main archive rebuilds of the same package", () => {
    expect(buildAttachmentArchiveMessageGroupId("MD-1")).not.toBe(
      buildAttachmentArchiveMessageGroupId("MD-1", { preferDraft: true }),
    );
  });

  it("preserves the legacy group id for main archive rebuilds", () => {
    expect(buildAttachmentArchiveMessageGroupId("MD-1", { preferDraft: false })).toBe(
      buildAttachmentArchiveMessageGroupId("MD-1"),
    );
  });

  it("does not set an unsupported per-message delay for the FIFO queue", async () => {
    await sendAttachmentArchiveRebuildRequest({
      packageId: "MD-1",
      source: "request",
      sourceScanRetryCount: 2,
    });

    const command = send.mock.calls[0]?.[0] as { input: Record<string, unknown> };
    expect(command.input).not.toHaveProperty("DelaySeconds");
    expect(command.input).toMatchObject({
      QueueUrl: process.env.ATTACHMENT_ARCHIVE_REBUILD_QUEUE_URL,
      MessageBody: JSON.stringify({
        packageId: "MD-1",
        source: "request",
        sourceScanRetryCount: 2,
      }),
    });
  });

  it("sends source-scan retries to the dedicated delayed queue", async () => {
    const message = {
      packageId: "MD-1",
      source: "request" as const,
      sourceScanRetryCount: 2,
    };

    await sendAttachmentArchiveRetryRequest(message);

    const command = send.mock.calls[0]?.[0] as { input: Record<string, unknown> };
    expect(command.input).not.toHaveProperty("DelaySeconds");
    expect(command.input).toMatchObject({
      QueueUrl: process.env.ATTACHMENT_ARCHIVE_RETRY_QUEUE_URL,
      MessageBody: JSON.stringify(message),
    });
  });
});
