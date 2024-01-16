import { z } from "zod";
import {
  zAdditionalInfo,
  zAttachmentOptional,
  zAttachmentRequired,
} from "@/pages/form/zod";

export const medicaidRespondToRaiSetup = {
  schema: z.object({
    additionalInformation: zAdditionalInfo.optional(),
    attachments: z.object({
      raiResponseLetter: zAttachmentRequired({ min: 1 }),
      other: zAttachmentOptional,
    }),
  }),
  attachments: [
    {
      name: "raiResponseLetter",
      label: "RAI Response Letter",
      required: true,
    },
    {
      name: "other",
      label: "Other",
      required: false,
    },
  ],
};

export const chipRespondToRaiSetup = {
  schema: z.object({
    additionalInformation: zAdditionalInfo,
    attachments: z.object({
      revisedAmendedStatePlanLanguage: zAttachmentRequired({ min: 1 }),
      officialRaiResponse: zAttachmentRequired({ min: 1 }),
      budgetDocuments: zAttachmentOptional,
      publicNotice: zAttachmentOptional,
      tribalConsultation: zAttachmentOptional,
      other: zAttachmentOptional,
    }),
  }),
  attachments: [
    {
      name: "revisedAmendedStatePlanLanguage",
      label: "Revised Amended State Plan Language",
      required: true,
    },
    {
      name: "officialRaiResponse",
      label: "Official RAI Response",
      required: true,
    },
    {
      name: "budgetDocuments",
      label: "Budget Documents",
      required: false,
    },
    {
      name: "publicNotice",
      label: "Public Notice",
      required: false,
    },
    {
      name: "tribalConsultation",
      label: "Tribal Consultation",
      required: false,
    },
    {
      name: "other",
      label: "Other",
      required: false,
    },
  ],
};
