import { z } from "zod";
import { attachmentSchema } from "../attachments";

// This is the event schema for ne submissions from our system
// TODO: APP-K Parent Id
export const onemacSchema = z.object({
  authority: z.string(),
  seaActionType: z.string().optional(), // Used by waivers.
  origin: z.string(),
  appkParentId: z.string().nullable().default(null),
  isAppkParent: z.boolean().default(false),
  additionalInformation: z.string().nullable().default(null),
  submitterName: z.string(),
  submitterEmail: z.string(),
  attachments: z.array(attachmentSchema).nullish(),
  raiWithdrawEnabled: z.boolean().default(false),
});

export type OneMac = z.infer<typeof onemacSchema>;
