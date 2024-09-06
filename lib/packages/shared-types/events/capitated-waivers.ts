import { z } from "zod";
import {
  attachmentArraySchema,
  attachmentArraySchemaOptional,
} from "../attachments";

const baseCapitatedWaiverSchema = z.object({
  // zAmendmentWaiverNumberSchema
  id: z.string(),
  proposedEffectiveDate: z.date(),
  attachments: z.object({
    bCapWaiverApplication: z.object({
      label: z
        .string()
        .default(
          "1915(b) Comprehensive (Capitated) Waiver Application Pre-print",
        ),
      files: attachmentArraySchema(),
    }),
    bCapCostSpreadsheets: z.object({
      label: z
        .string()
        .default(
          "1915(b) Comprehensive (Capitated) Waiver Cost Effectiveness Spreadsheets",
        ),
      files: attachmentArraySchema(),
    }),
    tribalConsultation: z.object({
      label: z.string().default("Tribal Consultation"),
      files: attachmentArraySchemaOptional(),
    }),
    other: z.object({
      label: z.string().default("Other"),
      files: attachmentArraySchemaOptional(),
    }),
  }),
  additionalInformation: z.string().max(4000).nullable().default(null),
});

export const amendmentFeSchema = baseCapitatedWaiverSchema.extend({
  // zAmendmentOriginalWaiverNumberSchema
  waiverNumber: z.number(),
  seaActionType: z.string().default("Amend"),
});

export const renewalFeSchema = baseCapitatedWaiverSchema.extend({
  // zAmendmentOriginalWaiverNumberSchema
  waiverNumber: z.number(),
  seaActionType: z.string().default("Renew"),
  attachments: z.object({
    bCapWaiverApplication: z.object({
      label: z
        .string()
        .default(
          "1915(b) Comprehensive (Capitated) Waiver Application Pre-print",
        ),
      files: attachmentArraySchema(),
    }),
    bCapCostSpreadsheets: z.object({
      label: z
        .string()
        .default(
          "1915(b) Comprehensive (Capitated) Waiver Cost Effectiveness Spreadsheets",
        ),
      files: attachmentArraySchema(),
    }),
    bCapIndependentAssessment: z.object({
      label: z
        .string()
        .default(
          "1915(b) Comprehensive (Capitated) Waiver Independent Assessment (first two renewals only)",
        ),
      files: attachmentArraySchemaOptional(),
    }),
    tribalConsultation: z.object({
      label: z.string().default("Tribal Consultation"),
      files: attachmentArraySchemaOptional(),
    }),
    other: z.object({
      label: z.string().default("Other"),
      files: attachmentArraySchemaOptional(),
    }),
  }),
});

export const initialFeSchema = baseCapitatedWaiverSchema.extend({
  seaActionType: z.string().default("New"),
});
