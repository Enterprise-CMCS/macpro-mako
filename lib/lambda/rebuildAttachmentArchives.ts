import { SQSHandler } from "aws-lambda";
import { opensearch, SEATOOL_STATUS } from "shared-types";

import { buildDraftAttachmentChangelog } from "../attachment-archive/draft-package";
import { AttachmentArchiveRebuildMessage } from "../attachment-archive/types";
import { getDraftPackage, getPackageChangelog } from "../libs/api/package";
import { rebuildPackageAttachmentArchives } from "./attachmentArchive-lib";

function parseRecordBody(body: string): AttachmentArchiveRebuildMessage {
  const parsed = JSON.parse(body) as Partial<AttachmentArchiveRebuildMessage>;
  if (!parsed.packageId || !parsed.source) {
    throw new Error("Attachment archive rebuild message must include packageId and source");
  }

  return parsed as AttachmentArchiveRebuildMessage;
}

async function getRebuildChangelog(
  message: AttachmentArchiveRebuildMessage,
): Promise<opensearch.changelog.ItemResult[]> {
  if (!message.preferDraft) {
    return (await getPackageChangelog(message.packageId)).hits
      .hits as opensearch.changelog.ItemResult[];
  }

  const draftResult = await getDraftPackage(message.packageId);
  const hasActiveDraft =
    draftResult?.found === true &&
    draftResult._source?.deleted !== true &&
    draftResult._source?.seatoolStatus === SEATOOL_STATUS.DRAFT;

  if (!hasActiveDraft) {
    return [];
  }

  return buildDraftAttachmentChangelog({
    packageId: message.packageId,
    submission: draftResult._source,
  });
}

export const handler: SQSHandler = async (event) => {
  for (const record of event.Records) {
    const message = parseRecordBody(record.body);
    const changelog = await getRebuildChangelog(message);

    const result = await rebuildPackageAttachmentArchives({
      packageId: message.packageId,
      changelog,
      archiveNamespace: message.preferDraft ? "draft" : "main",
    });

    console.info(
      JSON.stringify({
        event: "attachment_archive_rebuild_processed",
        packageId: message.packageId,
        latestTimestamp: message.latestTimestamp,
        preferDraft: message.preferDraft,
        source: message.source,
        result,
      }),
    );
  }
};
