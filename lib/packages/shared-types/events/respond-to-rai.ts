import { z } from "zod";
import { attachmentArraySchema, attachmentArraySchemaOptional } from "../attachments";

export const medicaidSpaAttachments = z.object({
  raiResponseLetter: z.object({
    files: attachmentArraySchema(),
    label: z.string().default("RAI Response Letter"),
  }),
  other: z.object({
    files: attachmentArraySchemaOptional(),
    label: z.string().default("Other"),
  }),
});
export const waiverAttachments = z.object({
  raiResponseLetterWaiver: z.object({
    files: attachmentArraySchema(),
    label: z.string().default("Waiver RAI Response Letter"),
  }),
  other: z.object({
    files: attachmentArraySchemaOptional(),
    label: z.string().default("Other"),
  }),
});

export const chipSpaAttachments = z.object({
  revisedAmendedStatePlanLanguage: z.object({
    files: attachmentArraySchema(),
    label: z.string().default("Revised Amended State Plan Language"),
  }),
  officialRAIResponse: z.object({
    files: attachmentArraySchema(),
    label: z.string().default("Official RAI Response"),
  }),
  budgetDocuments: z.object({
    files: attachmentArraySchemaOptional(),
    label: z.string().default("Budget Documents"),
  }),
  publicNotice: z.object({
    files: attachmentArraySchemaOptional(),
    label: z.string().default("Public Notice"),
  }),
  tribalConsultation: z.object({
    files: attachmentArraySchemaOptional(),
    label: z.string().default("Tribal Consultation"),
  }),
  other: z.object({
    files: attachmentArraySchemaOptional(),
    label: z.string().default("Other"),
  }),
});

export const baseSchema = z.object({
  event: z.literal("respond-to-rai"),
  additionalInformation: z.string().max(4000).nullable().default(null),
  attachments: chipSpaAttachments.or(waiverAttachments).or(medicaidSpaAttachments),
  id: z.string(),
  actionType: z.string(),
  origin: z.literal("mako").default("mako"),
  submitterName: z.string(),
  submitterEmail: z.string().email(),
  timestamp: z.number(),
});

export const schema = baseSchema.extend({
  authority: z.literal("1915(c)"),
  attachments: z.object({
    cmsForm179: z.object({
      label: z.string().default("CMS Form 179"),
      files: attachmentArraySchemaOptional(),
    }),
    spaPages: z.object({
      label: z.string().default("SPA Pages"),
      files: attachmentArraySchemaOptional(),
    }),
    other: z.object({
      label: z.string().default("Other"),
      files: attachmentArraySchemaOptional(),
    }),
  }),
  additionalInformation: z.string().nullable().default(null),
  proposedEffectiveDate: z.number().optional(),
  timestamp: z.number().optional(),
});
export type RespondToRai = z.infer<typeof schema>;
