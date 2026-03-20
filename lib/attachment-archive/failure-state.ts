import {
  AttachmentArchiveBlockedAttachment,
  AttachmentArchiveCurrent,
  AttachmentArchiveFailureCode,
  AttachmentArchiveSourceAttachment,
} from "./types";

const DEFAULT_FAILURE_MESSAGE = "Unable to prepare the attachment archive.";

export const ATTACHMENT_ARCHIVE_TERMINAL_FAILURE_CODES = new Set<AttachmentArchiveFailureCode>([
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
}: {
  failureCode: AttachmentArchiveFailureCode;
  blockedAttachment?: AttachmentArchiveBlockedAttachment;
}) {
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
  current?: Pick<AttachmentArchiveCurrent, "failureMessage" | "errorMessage" | "blockedAttachment">,
) {
  if (current?.failureMessage) {
    return current.failureMessage;
  }

  if (current?.blockedAttachment) {
    return buildAttachmentArchiveFailureMessage({
      failureCode: "ATTACHMENT_NOT_CLEAN",
      blockedAttachment: current.blockedAttachment,
    });
  }

  return current?.errorMessage || DEFAULT_FAILURE_MESSAGE;
}
