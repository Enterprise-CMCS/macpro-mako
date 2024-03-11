import { z } from "zod";
import { attachmentSchema } from "../attachments";

// This is the event schema for ne submissions from our system
export const onemacSchema = z.object({
  authority: z.string(),
  seaActionType: z.string().optional(), // Used by waivers and chip spas
  origin: z.string(),
  appkParentId: z.string().nullable().default(null),
  originalWaiverId: z.string().nullable().default(null),
  additionalInformation: z.string().nullable().default(null),
  submitterName: z.string(),
  submitterEmail: z.string(),
  attachments: z.array(attachmentSchema).nullish(),
  raiWithdrawEnabled: z.boolean().default(false),
});

export type OneMac = z.infer<typeof onemacSchema>;
