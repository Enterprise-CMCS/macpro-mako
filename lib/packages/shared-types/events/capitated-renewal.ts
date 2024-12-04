import { z } from "zod";
import {
  attachmentArraySchema,
  attachmentArraySchemaOptional,
} from "../attachments";

export const baseSchema = z.object({
  event: z.literal("capitated-renewal").default("capitated-renewal"),
  authority: z.string().default("1915(b)"),
  id: z
    .string()
    .min(1, { message: "Required" })
    .refine((id) => /^[A-Z]{2}-\d{4,5}\.R(?!00)\d{2}\.\d{2}$/.test(id), {
      message:
        "Renewal Number must be in the format of SS-####.R##.00 or SS-#####.R##.00 For renewals, the “R##” starts with '01' and ascends.",
    }),
  proposedEffectiveDate: z.number(),
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
  additionalInformation: z
    .string()
    .max(4000)
    .nullable()
    .default(null)
    .optional(),
  waiverNumber: z
    .string()
    .min(1, { message: "Required" })
    .refine((id) => /^[A-Z]{2}-\d{4,5}\.R\d{2}\.\d{2}$/.test(id), {
      message:
        "The approved 1915(b) Initial or Renewal Number must be in the format of SS-####.R##.## or SS-#####.R##.##.",
    }),
});

export const schema = baseSchema.extend({
  actionType: z.string().default("Renew"),
  origin: z.literal("mako").default("mako"),
  submitterName: z.string(),
  submitterEmail: z.string().email(),
  timestamp: z.number(),
  deleted: z.boolean().default(false),
});
