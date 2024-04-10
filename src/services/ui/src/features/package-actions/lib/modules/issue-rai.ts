import { z } from "zod";
import {
  AttachmentRecipe,
  zAdditionalInfo,
  zAttachmentOptional,
  zAttachmentRequired,
} from "@/utils";

export const defaultIssueRaiSchema = z.object({
  additionalInformation: zAdditionalInfo,
  attachments: z.object({
    formalRaiLetter: zAttachmentRequired({ min: 1 }),
    other: zAttachmentOptional,
  }),
});

export const defaultIssueRaiAttachments: AttachmentRecipe<
  z.infer<typeof defaultIssueRaiSchema>
>[] = [
  {
    name: "formalRaiLetter",
    label: "Formal RAI Letter",
    required: true,
  },
  {
    name: "other",
    label: "Other",
    required: false,
  },
];
