import { validateAttachmentArchiveCompletion } from "./attachmentArchive-lib";

export const handler = async (event: {
  archiveBucketName: string;
  artifactKey: string;
  currentKey: string;
  hash: string;
}) => {
  return await validateAttachmentArchiveCompletion({
    archiveBucketName: event.archiveBucketName,
    artifactKey: event.artifactKey,
    currentKey: event.currentKey,
    hash: event.hash,
  });
};
