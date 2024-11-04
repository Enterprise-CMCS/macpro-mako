import { z } from "zod";
import { attachmentSchema } from "../attachments";

export const respondToRaiBaseSchema = z.object({
  id: z.string(),
  authority: z.string(),
  origin: z.string(),
  requestedDate: z.number(),
  responseDate: z.number(),
  attachments: z.array(attachmentSchema).nullish(),
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
