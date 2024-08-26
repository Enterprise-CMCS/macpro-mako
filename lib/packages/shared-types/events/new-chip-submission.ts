import { z } from "zod";
import {
  attachmentArraySchema,
  attachmentArraySchemaOptional,
} from "../attachments";

export const feSchema = z.object({
  id: z.string(),
  additionalInformation: z.string().max(4000).nullable().default(null),
  attachments: z.object({
    currentStatePlan: z.object({
      files: attachmentArraySchema(),
      label: z.string().default("Current State Plan"),
    }),
    amendedLanguage: z.object({
      files: attachmentArraySchema(),
      label: z.string().default("Amended State Plan Language"),
    }),
    coverLetter: z.object({
      files: attachmentArraySchema(),
      label: z.string().default("Cover Letter"),
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
  }),
  proposedEffectiveDate: z.date(),
  seaActionType: z.string().default("Amend"),
});
