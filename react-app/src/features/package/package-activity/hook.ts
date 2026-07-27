import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { opensearch } from "shared-types";

import { getAttachmentArchive, getAttachmentUrl } from "@/api";

export type Attachments = NonNullable<opensearch.changelog.Document["attachments"]>;

type AttachmentArchiveRequest = {
  scope: "all" | "section";
  sectionId?: string;
};

const DEFAULT_POLL_AFTER_SECONDS = 3;
const DEFAULT_ATTACHMENT_ERROR_MESSAGE = "This attachment is no longer available.";
const DEFAULT_ARCHIVE_ERROR_MESSAGE = "Unable to prepare the attachment archive";
const DEFAULT_ARCHIVE_PREPARING_MESSAGE =
  "Preparing your download. Large packages can take several minutes — you can leave this page and check back later.";
const DEFAULT_ARCHIVE_TIMEOUT_MESSAGE =
  "This download is still being prepared. Please check back later and try again.";
const DEFAULT_SOURCE_SCAN_PENDING_MESSAGE =
  "Attachments are still being scanned. Please try again shortly.";
const MAX_ARCHIVE_BUILD_POLL_ATTEMPTS = 20;
const MAX_SOURCE_SCAN_POLL_ATTEMPTS = 60;

function sleep(ms: number) {
  return new Promise((resolve) => {
    window.setTimeout(resolve, ms);
  });
}

function getApiErrorMessage(error: unknown, fallback: string) {
  if (
    typeof error === "object" &&
    error &&
    "response" in error &&
    error.response &&
    typeof error.response === "object" &&
    "data" in error.response &&
    error.response.data &&
    typeof error.response.data === "object" &&
    "message" in error.response.data &&
    typeof error.response.data.message === "string"
  ) {
    return error.response.data.message;
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return fallback;
}

export const useAttachmentService = ({
  packageId,
  preferDraft = false,
}: {
  packageId: string;
  preferDraft?: boolean;
}) => {
  const { mutateAsync, error, isLoading } = useMutation((attachment: Attachments[number]) =>
    getAttachmentUrl(packageId, attachment.bucket, attachment.key, attachment.filename, {
      preferDraft,
    }),
  );
  const [archiveLoading, setArchiveLoading] = useState(false);
  const [archiveErrorMessage, setArchiveErrorMessage] = useState<string | undefined>();
  const [archiveWarningMessage, setArchiveWarningMessage] = useState<string | undefined>();
  const [archiveInfoMessage, setArchiveInfoMessage] = useState<string | undefined>();
  const [archiveCanRetry, setArchiveCanRetry] = useState(false);
  const [attachmentErrorMessage, setAttachmentErrorMessage] = useState<string | undefined>();
  const [lastArchiveRequest, setLastArchiveRequest] = useState<
    AttachmentArchiveRequest | undefined
  >();

  const onUrl = async (attachment: Attachments[number]) => {
    setAttachmentErrorMessage(undefined);

    try {
      return await mutateAsync(attachment);
    } catch (attachmentError) {
      const message = getApiErrorMessage(attachmentError, DEFAULT_ATTACHMENT_ERROR_MESSAGE);
      setAttachmentErrorMessage(message);
      console.error(attachmentError);
      return undefined;
    }
  };

  const onArchive = async ({
    scope,
    sectionId,
  }: AttachmentArchiveRequest): Promise<string | undefined> => {
    setArchiveErrorMessage(undefined);
    setArchiveWarningMessage(undefined);
    setArchiveInfoMessage(undefined);
    setArchiveCanRetry(false);
    setLastArchiveRequest({ scope, sectionId });
    setArchiveLoading(true);

    try {
      let archiveBuildAttempts = 0;
      let sourceScanAttempts = 0;

      while (
        archiveBuildAttempts < MAX_ARCHIVE_BUILD_POLL_ATTEMPTS &&
        sourceScanAttempts < MAX_SOURCE_SCAN_POLL_ATTEMPTS
      ) {
        const response = await getAttachmentArchive(packageId, scope, sectionId, {
          preferDraft,
        });

        if (response.status === "READY") {
          setArchiveInfoMessage(undefined);
          setArchiveWarningMessage(response.warningMessage);
          return response.url;
        }

        if (response.status === "FAILED") {
          setArchiveInfoMessage(undefined);
          setArchiveErrorMessage(response.message || DEFAULT_ARCHIVE_ERROR_MESSAGE);
          setArchiveCanRetry(Boolean(response.canRetry));
          return undefined;
        }

        if (response.reason === "SOURCE_SCAN_PENDING") {
          sourceScanAttempts += 1;
          setArchiveInfoMessage(undefined);
          setArchiveWarningMessage(response.message || DEFAULT_SOURCE_SCAN_PENDING_MESSAGE);
          if (sourceScanAttempts >= MAX_SOURCE_SCAN_POLL_ATTEMPTS) {
            throw new Error(response.message || DEFAULT_SOURCE_SCAN_PENDING_MESSAGE);
          }
        } else {
          archiveBuildAttempts += 1;
          setArchiveWarningMessage(undefined);
          setArchiveInfoMessage(
            archiveBuildAttempts >= MAX_ARCHIVE_BUILD_POLL_ATTEMPTS
              ? DEFAULT_ARCHIVE_TIMEOUT_MESSAGE
              : DEFAULT_ARCHIVE_PREPARING_MESSAGE,
          );
          if (archiveBuildAttempts >= MAX_ARCHIVE_BUILD_POLL_ATTEMPTS) {
            return undefined;
          }
        }

        await sleep((response.pollAfterSeconds || DEFAULT_POLL_AFTER_SECONDS) * 1000);
      }
    } catch (archiveError) {
      const message = getApiErrorMessage(archiveError, DEFAULT_ARCHIVE_ERROR_MESSAGE);
      setArchiveInfoMessage(undefined);
      setArchiveErrorMessage(message);
      setArchiveCanRetry(false);
      console.error(archiveError);
      return undefined;
    } finally {
      setArchiveLoading(false);
    }
  };

  const onRetryArchive = async (): Promise<string | undefined> => {
    if (!lastArchiveRequest) {
      return undefined;
    }

    return onArchive(lastArchiveRequest);
  };

  return {
    attachmentErrorMessage,
    archiveErrorMessage,
    archiveWarningMessage,
    archiveInfoMessage,
    archiveCanRetry,
    error,
    loading: isLoading || archiveLoading,
    onArchive,
    onRetryArchive,
    onUrl,
  };
};
