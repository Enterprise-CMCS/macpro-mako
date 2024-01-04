import { z } from "zod";
import {
  zAdditionalInfo,
  zFileAttachmentOptional,
  zFileAttachmentRequired,
} from "@/pages/form/zod";

export const zIssueRaiFormSchema = z.object({
  attachments: z.object({
    formalRaiLetter: zFileAttachmentRequired({ min: 1 }),
    other: zFileAttachmentOptional,
  }),
  additionalInfo: zAdditionalInfo.optional(),
});

export const zRespondToMedicaidRaiFormSchema = z.object({
  attachments: z.object({
    raiResponseLetter: zFileAttachmentRequired({ min: 1 }),
    other: zFileAttachmentOptional,
  }),
  additionalInfo: zAdditionalInfo.optional(),
});

export const zRespondToChipRaiFormSchema = z.object({
  attachments: z.object({
    revisedAmendedStatePlanLanguage: zFileAttachmentRequired({ min: 1 }),
    officialRaiResponse: zFileAttachmentRequired({ min: 1 }),
    budgetDocuments: zFileAttachmentOptional,
    publicNotice: zFileAttachmentOptional,
    tribalConsultation: zFileAttachmentOptional,
    other: zFileAttachmentOptional,
  }),
  additionalInfo: zAdditionalInfo.optional(),
});

export const zWithdrawRaiFormSchema = z.object({
  attachments: z.object({
    supportingDocumentation: zFileAttachmentOptional,
  }),
  additionalInfo: zAdditionalInfo,
});

export const zWithdrawPackageFormSchema = z.object({
  attachments: z.object({
    supportingDocumentation: zFileAttachmentOptional,
  }),
  additionalInfo: zAdditionalInfo.optional(),
});
