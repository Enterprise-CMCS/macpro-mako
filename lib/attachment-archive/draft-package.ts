import { opensearch } from "shared-types";
import { getDraftAttachmentDefaultLabel, getDraftAttachmentKeyOrder } from "shared-utils";

import type { AttachmentArchiveChangelogItem } from "./package-activity";

const DRAFT_ACTIVITY_ID_SUFFIX = "draft-activity";
const DRAFT_UPDATED_ACTIVITY_ID_SUFFIX = "draft-updated-activity";

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

const getTimestamp = (value: string | number | undefined, fallback: number) => {
  if (typeof value === "number") {
    return value;
  }

  if (typeof value === "string") {
    const timestamp = Date.parse(value);
    if (!Number.isNaN(timestamp)) {
      return timestamp;
    }
  }

  return fallback;
};

const isUpdatedByDifferentUser = (submission: opensearch.main.Document) => {
  const draft = submission.draft;
  const createdByName = draft?.createdByName ?? draft?.draftOwnerName ?? submission.submitterName;
  const createdByEmail =
    draft?.createdByEmail ?? draft?.draftOwnerEmail ?? submission.submitterEmail;
  const updatedByName = draft?.updatedByName ?? submission.submitterName;
  const updatedByEmail = draft?.updatedByEmail ?? submission.submitterEmail;

  if (!updatedByName) {
    return false;
  }

  if (updatedByEmail && createdByEmail) {
    return updatedByEmail.toLowerCase() !== createdByEmail.toLowerCase();
  }

  return updatedByName !== createdByName;
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
}): AttachmentArchiveChangelogItem[] => {
  const attachments = getDraftAttachments(submission);

  if (attachments.length === 0) {
    return [];
  }

  const savedTimestamp = getDraftSavedTimestamp(submission);
  const updatedByDifferentUser = isUpdatedByDifferentUser(submission);
  const draft = submission.draft;
  const activityIdSuffix = updatedByDifferentUser
    ? DRAFT_UPDATED_ACTIVITY_ID_SUFFIX
    : DRAFT_ACTIVITY_ID_SUFFIX;
  const submitterName = updatedByDifferentUser
    ? (draft?.updatedByName ?? submission.submitterName)
    : (draft?.createdByName ?? draft?.draftOwnerName ?? submission.submitterName);
  const timestamp = updatedByDifferentUser
    ? getTimestamp(draft?.updatedAt ?? draft?.savedAt, savedTimestamp)
    : getTimestamp(draft?.createdAt ?? draft?.savedAt, savedTimestamp);

  return [
    {
      _id: `${packageId}-${activityIdSuffix}`,
      _index: "draft-changelog",
      _score: 1,
      sort: [],
      found: true,
      _source: {
        id: `${packageId}-${activityIdSuffix}`,
        packageId,
        event: isDraftEvent(submission.event) ? submission.event : DRAFT_EVENT_FALLBACK,
        timestamp,
        submitterName,
        attachments,
      },
    },
  ];
};
