import {
  AttachmentArchiveBlockedAttachment,
  AttachmentArchiveCurrent,
  AttachmentArchiveFailureCode,
  AttachmentArchiveScope,
  AttachmentArchiveSourceAttachment,
} from "./types";

const DEFAULT_FAILURE_MESSAGE = "Unable to prepare the attachment archive.";
const PARTIAL_ARCHIVE_WARNING_MESSAGE =
  "Some attachments in this download are no longer available and were not included.";

export const ATTACHMENT_ARCHIVE_TERMINAL_FAILURE_CODES = new Set<AttachmentArchiveFailureCode>([
  "ALL_ATTACHMENTS_UNAVAILABLE",
  "ATTACHMENT_NOT_CLEAN",
]);

export function buildAttachmentArchiveBlockedAttachment(
  attachment: AttachmentArchiveSourceAttachment,
  virusScanStatus?: string,
): AttachmentArchiveBlockedAttachment {
  return {
    bucket: attachment.bucket,
    key: attachment.key,
    filename: attachment.filename,
    title: attachment.title,
    ...(virusScanStatus ? { virusScanStatus } : {}),
  };
}

export function buildAttachmentArchiveFailureMessage({
  failureCode,
  blockedAttachment,
  scope,
}: {
  failureCode: AttachmentArchiveFailureCode;
  blockedAttachment?: AttachmentArchiveBlockedAttachment;
  scope?: AttachmentArchiveScope;
}) {
  if (failureCode === "ALL_ATTACHMENTS_UNAVAILABLE") {
    return scope === "section"
      ? "The attachments in this section are no longer available, so this download could not be created."
      : "The attachments in this package are no longer available, so this download could not be created.";
  }

  if (failureCode === "ATTACHMENT_NOT_CLEAN") {
    const filename = blockedAttachment?.filename || "One of the attachments";
    return `Unable to prepare the attachment archive because ${filename} is not available for download. File scanning did not complete successfully.`;
  }

  return DEFAULT_FAILURE_MESSAGE;
}

export function buildAttachmentNotCleanArchiveFailure({
  attachment,
  virusScanStatus,
}: {
  attachment: AttachmentArchiveSourceAttachment;
  virusScanStatus?: string;
}) {
  const blockedAttachment = buildAttachmentArchiveBlockedAttachment(attachment, virusScanStatus);

  return {
    failureCode: "ATTACHMENT_NOT_CLEAN" as const,
    failureMessage: buildAttachmentArchiveFailureMessage({
      failureCode: "ATTACHMENT_NOT_CLEAN",
      blockedAttachment,
    }),
    blockedAttachment,
  };
}

export function buildAllAttachmentsUnavailableArchiveFailure(scope: AttachmentArchiveScope) {
  return {
    failureCode: "ALL_ATTACHMENTS_UNAVAILABLE" as const,
    failureMessage: buildAttachmentArchiveFailureMessage({
      failureCode: "ALL_ATTACHMENTS_UNAVAILABLE",
      scope,
    }),
  };
}

export function isTerminalAttachmentArchiveFailure(
  current?: Pick<AttachmentArchiveCurrent, "status" | "failureCode">,
): current is Pick<AttachmentArchiveCurrent, "status" | "failureCode"> & {
  status: "FAILED";
  failureCode: AttachmentArchiveFailureCode;
} {
  return !!(
    current?.status === "FAILED" &&
    current.failureCode &&
    ATTACHMENT_ARCHIVE_TERMINAL_FAILURE_CODES.has(current.failureCode)
  );
}

export function getAttachmentArchiveFailureMessage(
  current?: Pick<
    AttachmentArchiveCurrent,
    "failureCode" | "failureMessage" | "errorMessage" | "blockedAttachment" | "scope"
  >,
) {
  if (current?.failureMessage) {
    return current.failureMessage;
  }

  if (current?.failureCode === "ALL_ATTACHMENTS_UNAVAILABLE") {
    return buildAttachmentArchiveFailureMessage({
      failureCode: "ALL_ATTACHMENTS_UNAVAILABLE",
      scope: current.scope,
    });
  }

  if (current?.blockedAttachment) {
    return buildAttachmentArchiveFailureMessage({
      failureCode: "ATTACHMENT_NOT_CLEAN",
      blockedAttachment: current.blockedAttachment,
    });
  }

  return current?.errorMessage || DEFAULT_FAILURE_MESSAGE;
}

export function getAttachmentArchiveWarningMessage(
  current?: Pick<AttachmentArchiveCurrent, "status" | "skippedAttachmentCount">,
) {
  if (current?.status !== "READY" || !current.skippedAttachmentCount) {
    return undefined;
  }

  return PARTIAL_ARCHIVE_WARNING_MESSAGE;
}
