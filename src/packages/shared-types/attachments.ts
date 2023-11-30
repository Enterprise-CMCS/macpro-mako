export const attachmentTitleMap: Record<string, string> = {
  // SPA
  cmsForm179: "CMS Form 179",
  spaPages: "SPA Pages",
  coverLetter: "Cover Letter",
  tribalEngagement: "Tribal Engagement",
  existingStatePlanPages: "Existing State Plan Pages",
  publicNotice: "Public Notice",
  sfq: "SFQ",
  tribalConsultation: "Tribal Consultation",
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
