import { z } from "zod";
import { zAdditionalInfo, zAttachmentOptional } from "@/features/common/zod";

export const defaultWithdrawRaiSetup = {
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
