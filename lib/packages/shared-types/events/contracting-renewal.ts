import { z } from "zod";
import {
  attachmentArraySchema,
  attachmentArraySchemaOptional,
} from "../attachments";

export const baseSchema = z.object({
  // zAmendmentWaiverNumberSchema
  event: z.literal("contracting-renewal").default("contracting-renewal"),
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
    b4WaiverApplication: z.object({
      label: z
        .string()
        .default(
          "1915(b)(4) FFS Selective Contracting (Streamlined) Waiver Application Pre-print",
        ),
      files: attachmentArraySchema(),
    }),
    b4IndependentAssessment: z.object({
      label: z
        .string()
        .default(
          "1915(b)(4) FFS Selective Contracting (Streamlined) Independent Assessment (first two renewals only)",
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
});
