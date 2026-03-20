import { SQSHandler } from "aws-lambda";
import { opensearch } from "shared-types";

import { AttachmentArchiveRebuildMessage } from "../attachment-archive/types";
import { getPackageChangelog } from "../libs/api/package";
import { rebuildPackageAttachmentArchives } from "./attachmentArchive-lib";

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
    const changelog = (await getPackageChangelog(message.packageId)).hits
      .hits as opensearch.changelog.ItemResult[];

    const result = await rebuildPackageAttachmentArchives({
      packageId: message.packageId,
      changelog,
    });

    console.info(
      JSON.stringify({
        event: "attachment_archive_rebuild_processed",
        packageId: message.packageId,
        latestTimestamp: message.latestTimestamp,
        source: message.source,
        result,
      }),
    );
  }
};
