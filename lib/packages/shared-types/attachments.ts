import { z } from "zod";

import { s3ParseUrl } from "../shared-utils/s3-url-parser";

export const attachmentSchema = z.object({
  filename: z.string(),
  title: z.string(),
  bucket: z.string(),
  key: z.string(),
  uploadDate: z.number(),
});
export type Attachment = z.infer<typeof attachmentSchema>;

// Attachment schema for legacy records
export const legacyAttachmentSchema = z.object({
  s3Key: z.string(),
  filename: z.string(),
  title: z.string(),
  contentType: z.string(),
  url: z.string().url(),
});
export type LegacyAttachment = z.infer<typeof legacyAttachmentSchema>;

export function handleLegacyAttachment(attachment: LegacyAttachment): Attachment | null {
  console.log(attachment, "ATTACHMENT");
  const parsedUrl = s3ParseUrl(attachment.url || "");
  console.log(parsedUrl, "PARSED URL");
  if (!parsedUrl) return null;
  const bucket = parsedUrl.bucket;
  const key = parsedUrl.key;
  const uploadDate = parseInt(attachment.s3Key?.split("/")[0] || "0");
  return {
    title: attachment.title,
    filename: attachment.filename,
    uploadDate,
    bucket,
    key,
  } as Attachment;
}

export const attachmentArraySchema = ({
  max,
  message = "Required",
}: {
  max?: number;
  message?: string;
} = {}) => {
  const min = 1;
  const baseSchema = z.array(attachmentSchema);
  const noMax = max === 0 || max === undefined;
  if (noMax) {
    return baseSchema.min(min, { message });
  }

  return baseSchema.min(min, { message }).max(max, { message });
};

export const attachmentArraySchemaOptional = () => {
  const baseSchema = z.array(attachmentSchema);
  return baseSchema.optional();
};
