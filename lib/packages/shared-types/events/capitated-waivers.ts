import { z } from "zod";
import {
  attachmentArraySchema,
  attachmentArraySchemaOptional,
} from "../attachments";

export const amendmentFeSchema = z.object({
  // zAmendmentOriginalWaiverNumberSchema
  waiverNumber: z.number(),
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
  seaActionType: z.string().default("Amend"),
});
