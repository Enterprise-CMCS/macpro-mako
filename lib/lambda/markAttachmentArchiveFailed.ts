import { markAttachmentArchiveFailed } from "./attachmentArchive-lib";

export const handler = async (event: {
  archiveBucketName: string;
  artifactKey: string;
  attachmentCount: number;
  currentKey: string;
  error?: { Cause?: string; Error?: string };
  hash: string;
  manifestKey: string;
}) => {
  const errorMessage =
    event.error?.Cause || event.error?.Error || "Attachment archive execution failed";

  return await markAttachmentArchiveFailed({
    archiveBucketName: event.archiveBucketName,
    currentKey: event.currentKey,
    hash: event.hash,
    artifactKey: event.artifactKey,
    manifestKey: event.manifestKey,
    attachmentCount: event.attachmentCount,
    errorMessage,
  });
};
