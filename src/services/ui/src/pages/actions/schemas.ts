import { z } from "zod";
import {
  zAdditionalInfo,
  zFileAttachmentOptional,
  zFileAttachmentRequired,
} from "@/pages/form/zod";

const baselineFormSchema = z.object({
  additionalInfo: zAdditionalInfo,
});
export const zIssueRaiFormSchema = baselineFormSchema.merge(
  z.object({
    attachments: z.object({
      formalRaiLetter: zFileAttachmentRequired({ min: 1 }),
      other: zFileAttachmentOptional,
    }),
  })
);

export const zRespondToMedicaidRaiFormSchema = baselineFormSchema.merge(
  z.object({
    attachments: z.object({
      raiResponseLetter: zFileAttachmentRequired({ min: 1 }),
      other: zFileAttachmentOptional,
    }),
  })
);

export const zRespondToChipRaiFormSchema = baselineFormSchema.merge(
  z.object({
    attachments: z.object({
      revisedAmendedStatePlanLanguage: zFileAttachmentRequired({ min: 1 }),
      officialRaiResponse: zFileAttachmentRequired({ min: 1 }),
      budgetDocuments: zFileAttachmentOptional,
      publicNotice: zFileAttachmentOptional,
      tribalConsultation: zFileAttachmentOptional,
      other: zFileAttachmentOptional,
    }),
  })
);

export const zWithdrawRaiFormSchema = baselineFormSchema.merge(
  z.object({
    attachments: z.object({
      supportingDocumentation: zFileAttachmentOptional,
    }),
  })
);

export const zWithdrawPackageFormSchema = baselineFormSchema.merge(
  z.object({
    attachments: z.object({
      supportingDocumentation: zFileAttachmentOptional,
    }),
  })
);
