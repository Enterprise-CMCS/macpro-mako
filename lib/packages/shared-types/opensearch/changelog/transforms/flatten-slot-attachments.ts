interface SlotFile {
  filename?: string;
  bucket?: string;
  key?: string;
  uploadDate?: number;
}

interface SlotAttachment {
  label?: string;
  files?: SlotFile[];
}

export function flattenSlotAttachments(
  attachments: { [key: string]: SlotAttachment | undefined } | null | undefined,
) {
  if (!attachments) {
    return [];
  }

  return Object.values(attachments).flatMap((attachment) => {
    if (!attachment?.files?.length) {
      return [];
    }

    return attachment.files.map((file) => ({
      filename: file.filename ?? "",
      title: attachment.label ?? "",
      bucket: file.bucket ?? "",
      key: file.key ?? "",
      uploadDate: file.uploadDate ?? 0,
    }));
  });
}
