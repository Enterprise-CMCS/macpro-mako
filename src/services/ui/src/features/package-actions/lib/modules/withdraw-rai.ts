import { z } from "zod";
import {
  AttachmentRecipe,
  zAdditionalInfo,
  zAttachmentOptional,
} from "@/utils";

export const defaultWithdrawRaiSchema = z.object({
  additionalInformation: zAdditionalInfo,
  attachments: z.object({
    supportingDocumentation: zAttachmentOptional,
  }),
});

export const defaultWithdrawRaiAttachments: AttachmentRecipe<
  z.infer<typeof defaultWithdrawRaiSchema>
>[] = [
  {
    name: "supportingDocumentation",
    label: "Supporting Documentation",
    required: false,
  },
];
