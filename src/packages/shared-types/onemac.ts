import { z } from "zod";
import { onemacAttachmentSchema } from "./attachments";

// This is the event schema for ne submissions from our system
export const onemacSchema = z.object({
  authority: z.string(),
  origin: z.string(),
  additionalInformation: z.string().nullable().default(null),
  submitterName: z.string(),
  submitterEmail: z.string(),
  attachments: z.array(onemacAttachmentSchema).nullish(),
  raiWithdrawEnabled: z.boolean().default(false),
});

export type OneMac = z.infer<typeof onemacSchema>;
