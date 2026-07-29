import { SendMessageCommand, SQSClient } from "@aws-sdk/client-sqs";
import { createHash } from "crypto";

import { AttachmentArchiveRebuildMessage } from "./types";

const sqsClient = new SQSClient({ region: process.env.region || process.env.AWS_REGION });

export function buildAttachmentArchiveMessageGroupId(
  packageId: string,
  options: { preferDraft?: boolean } = {},
): string {
  const hashInput = options.preferDraft ? `${packageId}:draft` : packageId;
  return `package-${createHash("sha256").update(hashInput).digest("hex")}`;
}

export function hasAttachmentArchiveRebuildQueueConfigured(): boolean {
  return Boolean(process.env.ATTACHMENT_ARCHIVE_REBUILD_QUEUE_URL);
}

export function getAttachmentArchiveRebuildQueueUrl(): string {
  const queueUrl = process.env.ATTACHMENT_ARCHIVE_REBUILD_QUEUE_URL;
  if (!queueUrl) {
    throw new Error("ATTACHMENT_ARCHIVE_REBUILD_QUEUE_URL must be defined");
  }

  return queueUrl;
}

export async function sendAttachmentArchiveRebuildRequest(
  message: AttachmentArchiveRebuildMessage,
  options: { delaySeconds?: number } = {},
) {
  await sqsClient.send(
    new SendMessageCommand({
      QueueUrl: getAttachmentArchiveRebuildQueueUrl(),
      MessageBody: JSON.stringify(message),
      MessageGroupId: buildAttachmentArchiveMessageGroupId(message.packageId, {
        preferDraft: message.preferDraft,
      }),
      ...(typeof options.delaySeconds === "number" ? { DelaySeconds: options.delaySeconds } : {}),
    }),
  );
}
