import { z } from "zod";

export const withdrawRecordSchema = z.object({
  raiWithdrawEnabled: z.boolean().nullable(),
});

export type WithdrawRecord = z.infer<typeof withdrawRecordSchema>;
