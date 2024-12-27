import { z } from "zod";
import { attachmentArraySchemaOptional } from "../attachments";

export const baseSchema = z.object({
  event: z.literal("upload-subsequent-documents").default("upload-subsequent-documents"),
  additionalInformation: z.string().max(4000),
  attachments: z.record(
    z.string(),
    z.object({
      files: attachmentArraySchemaOptional(),
      label: z.string(),
    }),
  ),
  id: z.string(),
});

export const schema = baseSchema.extend({
  origin: z.literal("mako").default("mako"),
  submitterName: z.string(),
  submitterEmail: z.string().email(),
  timestamp: z.number(),
});
