import { z } from "zod";
import { onemacAttachmentSchema } from "../onemac";

export const withdrawRaiSchema = z.object({
  id: z.string(),
  submitterName: z.string(),
  submitterEmail: z.string(),
  activeRaiKey: z.number(),
  withdraw: z.object({
    withdrawDate: z.string(),
    withdrawAttachments: z.array(onemacAttachmentSchema).nullish(),
    additionalInformation: z.string().nullish(),
  }),
});

export const withdrawRecordSchema = z.object({
  raiWithdrawEnabled: z.boolean(),
});

export type WithdrawRaiRecord = z.infer<typeof withdrawRaiSchema>;
export type WithdrawRecord = z.infer<typeof withdrawRecordSchema>;
