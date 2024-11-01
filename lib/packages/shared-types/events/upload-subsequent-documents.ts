import { z } from "zod";
import { attachmentSchema } from "../attachments";

export const baseSchema = z.object({
  event: z
    .literal("upload-subsequent-documents")
    .default("upload-subsequent-documents"),
  additionalInformation: z.string().max(4000).default(null),
  attachments: z.array(attachmentSchema),
  id: z.string(),
});

export const schema = baseSchema.extend({
  origin: z.literal("mako").default("mako"),
  submitterName: z.string(),
  submitterEmail: z.string().email(),
  timestamp: z.number(),
});
