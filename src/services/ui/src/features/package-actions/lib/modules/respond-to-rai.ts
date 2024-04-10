import {
  AttachmentRecipe,
  zAdditionalInfo,
  zAttachmentOptional,
  zAttachmentRequired,
} from "@/utils";
import { z } from "zod";
export const chipSpaRaiSchema = z.object({
  additionalInformation: zAdditionalInfo.optional(),
  attachments: z.object({
    revisedAmendedStatePlanLanguage: zAttachmentRequired({ min: 1 }),
    officialRaiResponse: zAttachmentRequired({ min: 1 }),
    budgetDocuments: zAttachmentOptional,
    publicNotice: zAttachmentOptional,
    tribalConsultation: zAttachmentOptional,
    other: zAttachmentOptional,
  }),
});
export const chipSpaRaiAttachments: AttachmentRecipe<
  z.infer<typeof chipSpaRaiSchema>
>[] = [
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
];

export const medSpaRaiSchema = z.object({
  additionalInformation: zAdditionalInfo.optional(),
  attachments: z.object({
    raiResponseLetter: zAttachmentRequired({ min: 1 }),
    other: zAttachmentOptional,
  }),
});
export const medSpaRaiAttachments: AttachmentRecipe<
  z.infer<typeof medSpaRaiSchema>
>[] = [
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
];

export const bWaiverRaiSchema = z.object({
  additionalInformation: z.string().optional().default(""),
  attachments: z.object({
    raiResponseLetter: zAttachmentRequired({ min: 1 }),
    other: zAttachmentOptional,
  }),
});
export const bWaiverRaiAttachments: AttachmentRecipe<
  z.infer<typeof bWaiverRaiSchema>
>[] = [
  {
    name: "raiResponseLetter",
    required: true,
    label: "Waiver RAI Response",
  },
  { label: "Other", required: false, name: "other" },
];
