import { z } from "zod";
import { attachmentSchema } from "../attachments";
import { notificationMetadataSchema } from "../notification-metadata";
import { attachmentArraySchema, attachmentArraySchemaOptional } from "../attachments";

export const raiResponseSchema = z.object({
  id: z.string(),
  authority: z.string(),
  origin: z.string(),
  requestedDate: z.number(),
  responseDate: z.number(),
  attachments: z.array(attachmentSchema).nullish(),
  additionalInformation: z.string().nullable().default(null),
  submitterName: z.string(),
  submitterEmail: z.string(),
  notificationMetadata: notificationMetadataSchema.nullish(),
  timestamp: z.number().optional(),
});
export type RaiResponse = z.infer<typeof raiResponseSchema>;


// REference 

export const baseSchema = z.object({
  event: z
    .literal("respond-to-rai")
    .default("respond-to-rai"),
  additionalInformation: z.string().max(4000).nullable().default(null),
  attachments: z.object({
    cmsForm179: z.object({
      files: attachmentArraySchema({
        max: 1,
        message: "Required: You must submit exactly one file for CMS Form 179.",
      }),
      label: z.string().default("Revised Amended State Plan Language"),
    }),
    spaPages: z.object({
      files: attachmentArraySchema(),
      label: z.string().default("Official RAI Response"),
    }),
    coverLetter: z.object({
      files: attachmentArraySchemaOptional(),
      label: z.string().default("Budget Documents"),
    }),
    tribalEngagement: z.object({
      files: attachmentArraySchemaOptional(),
      label: z
        .string()
        .default("Public Notice"),
    }),
    existingStatePlanPages: z.object({
      files: attachmentArraySchemaOptional(),
      label: z.string().default("Tribal Consultation"),
    }),
    publicNotice: z.object({
      files: attachmentArraySchemaOptional(),
      label: z.string().default("Other"),
    }),
  }),
  id: z
    .string()
});

export const schema = baseSchema.extend({
  origin: z.literal("mako").default("mako"),
  submitterName: z.string(),
  submitterEmail: z.string().email(),
  timestamp: z.number(),
});

