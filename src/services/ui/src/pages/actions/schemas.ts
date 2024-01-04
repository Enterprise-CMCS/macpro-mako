import { z } from "zod";
import {
  zAdditionalInfo,
  zFileAttachmentOptional,
  zFileAttachmentRequired,
} from "@/pages/form/zod";
import { PlanType } from "shared-types";

const baselineFormSchema = z.object({
  zAdditionalInfo,
});
export const zIssueRaiFormSchema = baselineFormSchema.merge(
  z.object({
    attachments: z.object({
      formalRaiLetter: zFileAttachmentRequired({ min: 1 }),
      other: zFileAttachmentOptional,
    }),
  })
);

const zRespondToMedicaidRaiFormSchema = baselineFormSchema.merge(z.object({}));
const zRespondToChipRaiFormSchema = baselineFormSchema.merge(z.object({}));
/** Respond To RAI is a unique case where attachment names and configs change
 * for the action based on the planType of the associated package. This is a
 * safe getter for the proper RAI response schema. */
export const zRespondToRaiFormSchema = (planType: PlanType) => {
  const errorMsg =
    "[zRespondToRaiFormSchema]: Invalid planType, no associated RAI Response form schema.";
  switch (planType) {
    case PlanType.MED_SPA:
      return zRespondToMedicaidRaiFormSchema;
    case PlanType.CHIP_SPA:
      return zRespondToChipRaiFormSchema;
    default:
      console.error(errorMsg);
      throw Error(errorMsg);
  }
};

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
