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
  const [attachmentErrorMessage, setAttachmentErrorMessage] = useState<string | undefined>();

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
    setArchiveLoading(true);

    try {
      while (true) {
        const response = await getAttachmentArchive(packageId, scope, sectionId, {
          preferDraft,
        });

        if (response.status === "READY") {
          return response.url;
        }

        if (response.status === "FAILED") {
          throw new Error(response.message || DEFAULT_ARCHIVE_ERROR_MESSAGE);
        }

        await sleep((response.pollAfterSeconds || DEFAULT_POLL_AFTER_SECONDS) * 1000);
      }
    } catch (archiveError) {
      const message = getApiErrorMessage(archiveError, DEFAULT_ARCHIVE_ERROR_MESSAGE);
      setArchiveErrorMessage(message);
      console.error(archiveError);
      return undefined;
    } finally {
      setArchiveLoading(false);
    }
  };

  return {
    attachmentErrorMessage,
    archiveErrorMessage,
    error,
    loading: isLoading || archiveLoading,
    onArchive,
    onUrl,
  };
};
