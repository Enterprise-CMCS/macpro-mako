import { SQSHandler } from "aws-lambda";

import { sendAttachmentArchiveRebuildRequest } from "../attachment-archive/rebuild-queue";
import { AttachmentArchiveRebuildMessage } from "../attachment-archive/types";

function parseRecordBody(body: string): AttachmentArchiveRebuildMessage {
  const parsed = JSON.parse(body) as Partial<AttachmentArchiveRebuildMessage>;
  if (!parsed.packageId || !parsed.source) {
    throw new Error("Attachment archive rebuild message must include packageId and source");
  }

  return parsed as AttachmentArchiveRebuildMessage;
}

export const handler: SQSHandler = async (event) => {
  for (const record of event.Records) {
    const message = parseRecordBody(record.body);
    await sendAttachmentArchiveRebuildRequest(message);

    console.info(
      JSON.stringify({
        event: "attachment_archive_retry_forwarded",
        packageId: message.packageId,
        preferDraft: message.preferDraft,
        sourceScanRetryCount: message.sourceScanRetryCount,
      }),
    );
  }
};
