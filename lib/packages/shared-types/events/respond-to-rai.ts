import { z } from "zod";
import { attachmentArraySchema, attachmentArraySchemaOptional } from "../attachments";

export const respondToRaiBaseSchema = z.object({
  authority: z.string(),
  requestedDate: z.number(),
  responseDate: z.number(),
  submitterName: z.string(),
  submitterEmail: z.string(),
  proposedEffectiveDate: z.number().optional(),
  submittedDate: z.number().optional(),
});

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

export const baseSchema = respondToRaiBaseSchema.extend({
  event: z.literal("respond-to-rai").default("respond-to-rai"),
  additionalInformation: z.string().max(4000).nullable().default(null),
  attachments: chipSpaAttachments.or(waiverAttachments).or(medicaidSpaAttachments),
  id: z.string(),
});

export const schema = baseSchema.extend({
  origin: z.literal("mako").default("mako"),
  submitterName: z.string(),
  submitterEmail: z.string().email(),
  timestamp: z.number(),
});
