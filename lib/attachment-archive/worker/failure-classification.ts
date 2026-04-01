import { isAttachmentAccessDeniedError } from "../attachment-errors";
import { isNonCleanVirusScanStatus, VIRUS_SCAN_STATUS_TAG_KEY } from "../file-scan-status";
import { buildAttachmentNotCleanArchiveFailure } from "../failure-state";
import { AttachmentArchiveCurrent, AttachmentArchiveSourceAttachment } from "../types";

type AttachmentArchiveFailureState = Pick<
  AttachmentArchiveCurrent,
  "errorMessage" | "failureCode" | "failureMessage" | "blockedAttachment"
>;

function isFailureStateCandidate(
  value: unknown,
): value is Omit<AttachmentArchiveFailureState, "errorMessage"> {
  return !!(
    value &&
    typeof value === "object" &&
    "failureCode" in value &&
    typeof (value as AttachmentArchiveFailureState).failureCode === "string"
  );
}

export function getAttachmentArchiveFailureState(error: unknown): AttachmentArchiveFailureState {
  const errorMessage = error instanceof Error ? error.message : String(error);

  if (isFailureStateCandidate(error)) {
    return {
      errorMessage,
      failureCode: error.failureCode,
      failureMessage: error.failureMessage,
      blockedAttachment: error.blockedAttachment,
    };
  }

  return { errorMessage };
}

export async function classifyAttachmentArchiveAccessFailure({
  attachment,
  error,
  getObjectTags,
}: {
  attachment: AttachmentArchiveSourceAttachment;
  error: unknown;
  getObjectTags: (bucket: string, key: string) => Promise<Record<string, string>>;
}) {
  if (!isAttachmentAccessDeniedError(error)) {
    return undefined;
  }

  try {
    const tags = await getObjectTags(attachment.bucket, attachment.key);
    const virusScanStatus = tags[VIRUS_SCAN_STATUS_TAG_KEY];

    if (!isNonCleanVirusScanStatus(virusScanStatus)) {
      return undefined;
    }

    return buildAttachmentNotCleanArchiveFailure({
      attachment,
      virusScanStatus,
    });
  } catch (taggingError) {
    console.warn(
      JSON.stringify({
        event: "attachment_archive_failure_tag_lookup_failed",
        bucket: attachment.bucket,
        key: attachment.key,
        filename: attachment.filename,
        message: taggingError instanceof Error ? taggingError.message : String(taggingError),
      }),
    );
    return undefined;
  }
}
