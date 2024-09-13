import { z } from "zod";
import {
  attachmentArraySchema,
  attachmentArraySchemaOptional,
} from "../attachments";

const baseContractingWaiverSchema = z.object({
  // zAmendmentWaiverNumberSchema
  id: z.string(),
  proposedEffectiveDate: z.date(),
  attachments: z.object({
    b4WaiverApplication: z.object({
      label: z
        .string()
        .default(
          "1915(b)(4) FFS Selective Contracting (Streamlined) Waiver Application Pre-print",
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

export const amendmentFeSchema = baseContractingWaiverSchema.extend({
  // zAmendmentOriginalWaiverNumberSchema
  waiverNumber: z.string(),
  seaActionType: z.string().default("Amend"),
});

export const renewalFeSchema = baseContractingWaiverSchema.extend({
  // zAmendmentOriginalWaiverNumberSchema
  waiverNumber: z.string(),
  seaActionType: z.string().default("Renew"),
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
});

export const initialFeSchema = baseContractingWaiverSchema.extend({
  seaActionType: z.string().default("New"),
});
