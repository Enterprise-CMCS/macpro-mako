import { opensearch } from "shared-types";
import { getDraftAttachmentDefaultLabel, getDraftAttachmentKeyOrder } from "shared-utils";

const DRAFT_ACTIVITY_ID_SUFFIX = "draft-activity";

const DRAFT_EVENT_FALLBACK: opensearch.changelog.Document["event"] = "new-medicaid-submission";

const isDraftEvent = (event: unknown): event is opensearch.changelog.Document["event"] =>
  [
    "app-k",
    "capitated-amendment",
    "capitated-initial",
    "capitated-renewal",
    "contracting-amendment",
    "contracting-initial",
    "contracting-renewal",
    "legacy-admin-change",
    "legacy-withdraw-rai-request",
    "new-chip-details-submission",
    "new-chip-submission",
    "new-medicaid-submission",
    "respond-to-rai",
    "temporary-extension",
    "toggle-withdraw-rai",
    "upload-subsequent-documents",
    "withdraw-package",
    "withdraw-rai",
    "update-values",
    "update-id",
    "delete",
    "split-spa",
    "NOSO",
  ].includes(event as opensearch.changelog.Document["event"]);

const getDraftSavedTimestamp = (submission: opensearch.main.Document) => {
  const savedAt = submission.draft?.savedAt ? Date.parse(submission.draft.savedAt) : NaN;
  if (!Number.isNaN(savedAt)) {
    return savedAt;
  }

  const changedAt = submission.makoChangedDate ? Date.parse(submission.makoChangedDate) : NaN;
  if (!Number.isNaN(changedAt)) {
    return changedAt;
  }

  return Date.now();
};

export const getDraftAttachments = (
  submission?: opensearch.main.Document,
): NonNullable<opensearch.changelog.Document["attachments"]> => {
  const attachmentSections = (submission?.draft?.data as Record<string, unknown> | undefined)
    ?.attachments;

  if (!attachmentSections || typeof attachmentSections !== "object") {
    return [];
  }

  const attachmentKeyOrder = getDraftAttachmentKeyOrder(submission?.event);
  const attachmentKeyOrderIndex = new Map(
    attachmentKeyOrder.map((attachmentKey, index) => [attachmentKey, index]),
  );
  const orderedAttachmentEntries = Object.entries(attachmentSections)
    .map(([attachmentKey, attachmentSection], originalIndex) => ({
      attachmentKey,
      attachmentSection,
      originalIndex,
      sortIndex: attachmentKeyOrderIndex.get(attachmentKey) ?? Number.MAX_SAFE_INTEGER,
    }))
    .sort((left, right) => {
      if (left.sortIndex !== right.sortIndex) {
        return left.sortIndex - right.sortIndex;
      }

      return left.originalIndex - right.originalIndex;
    });

  return orderedAttachmentEntries.flatMap(({ attachmentKey, attachmentSection }) => {
    if (!attachmentSection || typeof attachmentSection !== "object") {
      return [];
    }

    const sectionLabel =
      typeof (attachmentSection as { label?: unknown }).label === "string" &&
      (attachmentSection as { label?: string }).label?.trim()
        ? (attachmentSection as { label: string }).label.trim()
        : (getDraftAttachmentDefaultLabel(submission?.event, attachmentKey) ?? attachmentKey);

    const files = (attachmentSection as { files?: unknown }).files;
    if (!Array.isArray(files) || files.length === 0) {
      return [];
    }

    return files.flatMap((file) => {
      if (!file || typeof file !== "object") {
        return [];
      }

      const maybeAttachment = file as Record<string, unknown>;
      const filename =
        typeof maybeAttachment.filename === "string" ? maybeAttachment.filename : undefined;
      const bucket =
        typeof maybeAttachment.bucket === "string" ? maybeAttachment.bucket : undefined;
      const key = typeof maybeAttachment.key === "string" ? maybeAttachment.key : undefined;
      const uploadDate =
        typeof maybeAttachment.uploadDate === "number" ? maybeAttachment.uploadDate : undefined;
      const title =
        typeof maybeAttachment.title === "string" && maybeAttachment.title.trim()
          ? maybeAttachment.title
          : sectionLabel;

      if (!filename || !bucket || !key || typeof uploadDate !== "number") {
        return [];
      }

      return [
        {
          filename,
          bucket,
          key,
          uploadDate,
          title,
        },
      ];
    });
  });
};

export const buildDraftAttachmentChangelog = ({
  packageId,
  submission,
}: {
  packageId: string;
  submission: opensearch.main.Document;
}): opensearch.changelog.ItemResult[] => {
  const attachments = getDraftAttachments(submission);

  if (attachments.length === 0) {
    return [];
  }

  return [
    {
      _id: `${packageId}-${DRAFT_ACTIVITY_ID_SUFFIX}`,
      _index: "draft-changelog",
      _score: 1,
      sort: [],
      found: true,
      _source: {
        id: `${packageId}-${DRAFT_ACTIVITY_ID_SUFFIX}`,
        packageId,
        event: isDraftEvent(submission.event) ? submission.event : DRAFT_EVENT_FALLBACK,
        timestamp: getDraftSavedTimestamp(submission),
        submitterName: submission.submitterName,
        attachments,
      } as opensearch.changelog.Document,
    },
  ];
};
