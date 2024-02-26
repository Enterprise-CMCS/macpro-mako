import { z } from "zod";
import { s3ParseUrl } from "shared-utils/s3-url-parser";

export const attachmentTitleMap: Record<string, string> = {
  // SPA
  cmsForm179: "CMS Form 179",
  currentStatePlan: "Current State Plan",
  spaPages: "SPA Pages",
  coverLetter: "Cover Letter",
  tribalEngagement: "Document Demonstrating Good-Faith Tribal Engagement",
  existingStatePlanPages: "Existing State Plan Page(s)",
  publicNotice: "Public Notice",
  sfq: "Standard Funding Questions (SFQs)",
  tribalConsultation: "Tribal Consultation",
  amendedLanguage: "Amended State Plan Language",
  budgetDocuments: "Budget Documents",
  // ISSUE RAI
  formalRaiLetter: "Formal RAI Letter",
  // RAI RESPONSE
  raiResponseLetter: "RAI Response Letter",
  // MISC
  other: "Other",
  // RAI WITHDRAW
  supportingDocumentation: "Supporting Documentation",
  bCapWaiverApplication:
    "1915(b) Comprehensive (Capitated) Waiver Application Pre-print",
  bCapCostSpreadsheets:
    "1915(b) Comprehensive (Capitated) Waiver Cost Effectiveness Spreadsheets",
  bCapIndependentAssessment:
    "1915(b) Comprehensive (Capitated) Waiver Independent Assessment (first two renewals only)",
  b4WaiverApplication:
    "1915(b)(4) FFS Selective Contracting (Streamlined) Waiver Application Pre-print",
  b4IndependentAssessment:
    "1915(b)(4) FFS Selective Contracting (Streamlined) Independent Assessment (first two renewals only)",
};
export type AttachmentKey = keyof typeof attachmentTitleMap;
export type AttachmentTitle = typeof attachmentTitleMap[AttachmentKey];

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

export function handleLegacyAttachment(
  attachment: LegacyAttachment
): Attachment | null {
  const parsedUrl = s3ParseUrl(attachment.url || "");
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
