import { z } from "zod";

export const withdrawRecordSchema = z.object({
  raiWithdrawEnabled: z.boolean(),
});
