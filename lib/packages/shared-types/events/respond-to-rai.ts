import { z } from "zod";
import { attachmentArraySchema, attachmentArraySchemaOptional } from "../attachments";

export const respondToRaiBaseSchema = z.object({
  id: z.string(),
  authority: z.string(),
  origin: z.string(),
  requestedDate: z.number(),
  responseDate: z.number(),
  attachments: z.object({
    cmsForm179: z.object({
      label: z
        .string()
        .default("1915(b)(4) FFS Selective Contracting (Streamlined) Waiver Application Pre-print"),
      files: attachmentArraySchema(),
    }),
    spaPages: z.object({
      label: z.string().default(""),
      files: attachmentArraySchemaOptional(),
    }),
    other: z.object({
      label: z.string().default("Other"),
      files: attachmentArraySchemaOptional(),
    }),
  }),
  additionalInformation: z.string().nullable().default(null),
  submitterName: z.string(),
  submitterEmail: z.string(),
  proposedEffectiveDate: z.number().optional(),
  submittedDate: z.number().optional(),
  timestamp: z.number().optional(),
});

export type RespondToRaiSchema = z.infer<typeof respondToRaiBaseSchema>;

export const schema = respondToRaiBaseSchema.extend({
  actionType: z.string().default("Respond"),
  origin: z.literal("mako").default("mako"),
  submitterName: z.string(),
  submitterEmail: z.string().email(),
  timestamp: z.number(),
});
