import { z } from "zod";
import { attachmentSchema } from "../attachments";

// This is the event schema for ne submissions from our system
export const updateIdSchema = z.object({
  newId: z.string(),
  timestamp: z.string().optional(), // Used by waivers and chip spas
  origin: z.string(),
  additionalInformation: z.string().nullable().default(null),
  submitterName: z.string(),
  submitterEmail: z.string(),
  attachments: z.array(attachmentSchema).nullish(),
});

export type UpdateId = z.infer<typeof updateIdSchema>;
