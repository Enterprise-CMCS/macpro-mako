export function isAllAttachmentsUnavailableArchive({
  appendedAttachmentCount,
  skippedAttachmentCount,
}: {
  appendedAttachmentCount: number;
  skippedAttachmentCount: number;
}) {
  return appendedAttachmentCount === 0 && skippedAttachmentCount > 0;
}
