import { z } from "zod";

import { attachmentArraySchema, attachmentArraySchemaOptional } from "../attachments";
import { sharedSchema } from "./base-schema";

export const baseSchema = z.object({
  event: z.literal("new-chip-details-submission").default("new-chip-details-submission"),
  chipSubmissionType: z.array(z.string()).optional().default([]),
  additionalInformation: z.string().max(4000).nullable().default(null).optional(),
  attachments: z.object({
    chipEligibility: z.object({
      files: attachmentArraySchema(),
      label: z.string().default("CHIP Eligibility Template"),
    }),
    coverLetter: z.object({
      files: attachmentArraySchema(),
      label: z.string().default("Cover Letter"),
    }),
    currentStatePlan: z.object({
      files: attachmentArraySchemaOptional(),
      label: z.string().default("Current State Plan"),
    }),
    amendedLanguage: z.object({
      files: attachmentArraySchemaOptional(),
      label: z.string().default("Amended State Plan Language"),
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
  authority: z.string().default("CHIP SPA"),
  proposedEffectiveDate: z.number(),
  actionType: z.string().default("Amend"),
  id: z
    .string()
    .min(1, { message: "Required" })
    .refine((id) => /^[A-Z]{2}-\d{2}-\d{4}(-[A-Z0-9]{1,4})?$/.test(id), {
      message: "ID doesn't match format SS-YY-NNNN or SS-YY-NNNN-XXXX",
    }),
});

export const schema = baseSchema.merge(sharedSchema);
