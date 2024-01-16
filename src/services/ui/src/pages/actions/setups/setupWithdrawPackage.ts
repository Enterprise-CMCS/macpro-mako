import { z } from "zod";
import {
  zAdditionalInfo,
  zAttachmentOptional,
  zAttachmentRequired,
} from "@/pages/form/zod";

export const medicaidWithdrawPackageSetup = {
  schema: z.object({
    additionalInformation: zAdditionalInfo,
    attachments: z.object({
      supportingDocumentation: zAttachmentOptional,
    }),
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
    additionalInformation: zAdditionalInfo,
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
