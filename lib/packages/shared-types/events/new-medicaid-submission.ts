import { z } from "zod";
import {
  attachmentArraySchema,
  attachmentArraySchemaOptional,
} from "../attachments";
// import { APIGatewayEvent } from "aws-lambda";

export const baseSchema = z.object({
  event: z
    .literal("new-medicaid-submission")
    .default("new-medicaid-submission"),
  additionalInformation: z.string().max(4000).nullable().default(null),
  attachments: z.object({
    cmsForm179: z.object({
      files: attachmentArraySchema({
        max: 1,
        message: "Required: You must submit exactly one file for CMS Form 179.",
      }),
      label: z.string().default("CMS Form 179"),
    }),
    spaPages: z.object({
      files: attachmentArraySchema(),
      label: z.string().default("SPA Pages"),
    }),
    coverLetter: z.object({
      files: attachmentArraySchemaOptional(),
      label: z.string().default("Cover Letter"),
    }),
    tribalEngagement: z.object({
      files: attachmentArraySchemaOptional(),
      label: z
        .string()
        .default("Document Demonstrating Good-Faith Tribal Engagement"),
    }),
    existingStatePlanPages: z.object({
      files: attachmentArraySchemaOptional(),
      label: z.string().default("Existing State Plan Page(s)"),
    }),
    publicNotice: z.object({
      files: attachmentArraySchemaOptional(),
      label: z.string().default("Public Notice"),
    }),
    sfq: z.object({
      files: attachmentArraySchemaOptional(),
      label: z.string().default("Standard Funding Questions (SFQs)"),
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
  authority: z.string().default("Medicaid SPA"),
  proposedEffectiveDate: z.number(),
  id: z
    .string()
    .min(1, { message: "Required" })
    .refine((id) => /^[A-Z]{2}-\d{2}-\d{4}(-[A-Z0-9]{1,4})?$/.test(id), {
      message: "ID doesn't match format SS-YY-NNNN or SS-YY-NNNN-XXXX",
    }),
});

export const schema = baseSchema.extend({
  origin: z.literal("mako").default("mako"),
  submitterName: z.string(),
  submitterEmail: z.string().email(),
  timestamp: z.number(),
});
