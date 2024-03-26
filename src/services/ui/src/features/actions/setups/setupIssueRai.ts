import { z } from "zod";
import {
  zAdditionalInfo,
  zAttachmentOptional,
  zAttachmentRequired,
} from "@/utils";

export const defaultIssueRaiSetup = {
  schema: z.object({
    additionalInformation: zAdditionalInfo,
    attachments: z.object({
      formalRaiLetter: zAttachmentRequired({ min: 1 }),
      other: zAttachmentOptional,
    }),
  }),
  attachments: [
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
  ],
};
