import { z } from "zod";
import {
  AttachmentRecipe,
  zAdditionalInfo,
  zAttachmentOptional,
  zAttachmentRequired,
} from "@/utils";

export const chipWithdrawPackageSchema = z.object({
  additionalInformation: zAdditionalInfo.optional(),
  attachments: z.object({
    officialWithdrawalLetter: zAttachmentRequired({ min: 1 }),
  }),
});
export const chipWithdrawPackageAttachments: AttachmentRecipe<
  z.infer<typeof chipWithdrawPackageSchema>
>[] = [
  {
    name: "officialWithdrawalLetter",
    label: "Official Withdrawal Letter",
    required: true,
  },
];

export const defaultWithdrawPackageSchema = z
  .object({
    additionalInformation: zAdditionalInfo.optional(),
    attachments: z.object({
      supportingDocumentation: zAttachmentOptional,
    }),
  })
  .superRefine((data, ctx) => {
    if (
      !data.attachments.supportingDocumentation?.length &&
      data.additionalInformation === undefined
    ) {
      ctx.addIssue({
        message: "An Attachment or Additional Information is required.",
        code: z.ZodIssueCode.custom,
        fatal: true,
      });
      // Zod says this is to appease types
      // https://github.com/colinhacks/zod?tab=readme-ov-file#type-refinements
      return z.NEVER;
    }
  });
export const defaultWithdrawPackageAttachments: AttachmentRecipe<
  z.infer<typeof defaultWithdrawPackageSchema>
>[] = [
  {
    name: "supportingDocumentation",
    label: "Supporting Documentation",
    required: false,
  },
];
