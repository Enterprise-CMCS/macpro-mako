import {
  getAttachmentErrorMessage,
  isAttachmentAccessDeniedError,
  isAttachmentNotFoundError,
  isLegacyAttachmentUnavailableError,
} from "../attachment-errors";
import { AttachmentBucketMap, resolveTargetBucket } from "../bucket-routing";
import {
  AttachmentArchiveBlockedAttachment,
  AttachmentArchiveFailureCode,
  AttachmentArchiveSourceAttachment,
} from "../types";

interface LoadArchiveAttachmentParams<TBody> {
  attachment: AttachmentArchiveSourceAttachment;
  attachmentBucketMap: AttachmentBucketMap;
  consumer: string;
  getAttachmentBody: (bucket: string, key: string) => Promise<TBody>;
  classifyAccessFailure?: (params: {
    attachment: AttachmentArchiveSourceAttachment;
    error: unknown;
  }) => Promise<
    | {
        blockedAttachment?: AttachmentArchiveBlockedAttachment;
        failureCode: AttachmentArchiveFailureCode;
        failureMessage: string;
      }
    | undefined
  >;
  logInfo?: (message: string) => void;
  logWarn?: (message: string) => void;
}

type LoadArchiveAttachmentResult<TBody> =
  | {
      body: TBody;
      skipped: false;
    }
  | {
      skipped: true;
    };

function logSkippedAttachment({
  attachment,
  consumer,
  destinationBucket,
  error,
  logWarn,
}: {
  attachment: AttachmentArchiveSourceAttachment;
  consumer: string;
  destinationBucket?: string;
  error: unknown;
  logWarn: (message: string) => void;
}) {
  logWarn(
    JSON.stringify({
      event: "attachment_archive_attachment_skipped",
      bucket: attachment.bucket,
      destinationBucket,
      key: attachment.key,
      filename: attachment.filename,
      consumer,
      reason: getAttachmentErrorMessage(error),
    }),
  );
}

async function maybeThrowStructuredFailure({
  attachment,
  classifyAccessFailure,
  error,
}: {
  attachment: AttachmentArchiveSourceAttachment;
  classifyAccessFailure?: LoadArchiveAttachmentParams<unknown>["classifyAccessFailure"];
  error: unknown;
}) {
  if (!classifyAccessFailure) {
    return;
  }

  const failure = await classifyAccessFailure({
    attachment,
    error,
  });

  if (!failure) {
    return;
  }

  throw Object.assign(new Error(failure.failureMessage), failure, {
    cause: error,
  });
}

export async function loadArchiveAttachment<TBody>({
  attachment,
  attachmentBucketMap,
  consumer,
  getAttachmentBody,
  classifyAccessFailure,
  logInfo = console.info,
  logWarn = console.warn,
}: LoadArchiveAttachmentParams<TBody>): Promise<LoadArchiveAttachmentResult<TBody>> {
  const resolution = resolveTargetBucket(attachment.bucket, attachmentBucketMap);

  if (resolution.remapped) {
    logInfo(
      JSON.stringify({
        event: "legacy_attachment_remap_applied",
        bucket: attachment.bucket,
        destinationBucket: resolution.destinationBucket,
        key: attachment.key,
        filename: attachment.filename,
        consumer,
      }),
    );

    try {
      return {
        body: await getAttachmentBody(resolution.destinationBucket, attachment.key),
        skipped: false,
      };
    } catch (error) {
      const accessDenied = isAttachmentAccessDeniedError(error);
      if (accessDenied) {
        await maybeThrowStructuredFailure({
          attachment: {
            ...attachment,
            bucket: resolution.destinationBucket,
          },
          classifyAccessFailure,
          error,
        });
      }

      // If the mirrored legacy bucket is missing the object, S3 may surface either
      // a not-found or access-denied style error depending on bucket permissions.
      // In both cases we want to fall back to the original legacy upload bucket.
      if (!isAttachmentNotFoundError(error) && !accessDenied) {
        throw error;
      }

      logWarn(
        JSON.stringify({
          event: "legacy_attachment_remap_fallback",
          bucket: attachment.bucket,
          destinationBucket: resolution.destinationBucket,
          key: attachment.key,
          filename: attachment.filename,
          consumer,
          reason: getAttachmentErrorMessage(error),
        }),
      );
    }
  }

  try {
    return {
      body: await getAttachmentBody(resolution.sourceBucket, attachment.key),
      skipped: false,
    };
  } catch (error) {
    const accessDenied = isAttachmentAccessDeniedError(error);

    if (accessDenied) {
      await maybeThrowStructuredFailure({
        attachment: {
          ...attachment,
          bucket: resolution.sourceBucket,
        },
        classifyAccessFailure,
        error,
      });
    }

    const legacyUnavailable = isLegacyAttachmentUnavailableError(resolution.sourceBucket, error);

    if (accessDenied && !legacyUnavailable) {
      throw error;
    }

    if (!isAttachmentNotFoundError(error) && !legacyUnavailable) {
      throw error;
    }

    logSkippedAttachment({
      attachment,
      consumer,
      destinationBucket: resolution.remapped ? resolution.destinationBucket : undefined,
      error,
      logWarn,
    });

    return {
      skipped: true,
    };
  }
}
