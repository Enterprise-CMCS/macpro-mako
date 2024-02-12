import { z } from "zod";
import {
  zAdditionalInfo,
  zAttachmentOptional,
  zAttachmentRequired,
} from "@/features";

export const medicaidWithdrawPackageSetup = {
  schema: z
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
    }),
  attachments: [
    {
      name: "supportingDocumentation",
      label: "Supporting Documentation",
      required: false,
    },
  ],
};

export const chipWithdrawPackageSetup = {
  schema: z.object({
    additionalInformation: zAdditionalInfo.optional(),
    attachments: z.object({
      officialWithdrawalLetter: zAttachmentRequired({ min: 1 }),
    }),
  }),
  attachments: [
    {
      name: "officialWithdrawalLetter",
      label: "Official Withdrawal Letter",
      required: true,
    },
  ],
};
