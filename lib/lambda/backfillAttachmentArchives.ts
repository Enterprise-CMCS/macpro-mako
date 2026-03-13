import { getAttachmentArchiveBackfillPage } from "../attachment-archive/backfill";
import { sendAttachmentArchiveRebuildRequest } from "../attachment-archive/rebuild-queue";

type BackfillEvent = {
  afterKey?: string;
  pageSize?: number;
};

export const handler = async (event: BackfillEvent = {}) => {
  const page = await getAttachmentArchiveBackfillPage({ afterKey: event.afterKey });

  await Promise.all(
    page.packageIds.map((packageId) =>
      sendAttachmentArchiveRebuildRequest({
        packageId,
        source: "backfill",
      }),
    ),
  );

  return {
    afterKey: page.afterKey,
    done: page.done,
    enqueuedCount: page.packageIds.length,
    packageIds: page.packageIds,
  };
};
