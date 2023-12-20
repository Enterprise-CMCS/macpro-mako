import { z } from "zod";
import { s3ParseUrl } from "shared-utils/s3-url-parser";

export const attachmentTitleMap: Record<string, string> = {
  // SPA
  cmsForm179: "CMS Form 179",
  currentStatePlan: "Current State Plan",
  spaPages: "SPA Pages",
  coverLetter: "Cover Letter",
  tribalEngagement: "Tribal Engagement",
  existingStatePlanPages: "Existing State Plan Pages",
  publicNotice: "Public Notice",
  sfq: "SFQ",
  tribalConsultation: "Tribal Consultation",
  amendedLanguage: "Amended Language",
  budgetDocuments: "Budget Documents",
  // ISSUE RAI
  formalRaiLetter: "Formal RAI Letter",
  // RAI RESPONSE
  raiResponseLetter: "RAI Response Letter",
  // MISC
  other: "Other",
  // RAI WITHDRAW
  supportingDocumentation: "Supporting Documentation",
};
export type AttachmentKey = keyof typeof attachmentTitleMap;
export type AttachmentTitle = typeof attachmentTitleMap[AttachmentKey];

export const onemacAttachmentSchema = z.object({
  s3Key: z.string().nullish(),
  filename: z.string(),
  title: z.string(),
  contentType: z.string().nullish(),
  url: z.string().url().nullish(),
  bucket: z.string().nullish(),
  key: z.string().nullish(),
  uploadDate: z.number().nullish(),
});
export type OnemacAttachmentSchema = z.infer<typeof onemacAttachmentSchema>;

export function handleAttachment(attachment: OnemacAttachmentSchema) {
  let bucket = "";
  let key = "";
  let uploadDate = 0;
  if ("bucket" in attachment) {
    bucket = attachment.bucket as string;
  }
  if ("key" in attachment) {
    key = attachment.key as string;
  }
  if ("uploadDate" in attachment) {
    uploadDate = attachment.uploadDate as number;
  }
  if (bucket == "") {
    const parsedUrl = s3ParseUrl(attachment.url || "");
    if (!parsedUrl) return null;
    bucket = parsedUrl.bucket;
    key = parsedUrl.key;
    uploadDate = parseInt(attachment.s3Key?.split("/")[0] || "0");
  }

  return {
    title: attachment.title,
    filename: attachment.filename,
    uploadDate,
    bucket,
    key,
  };
}
