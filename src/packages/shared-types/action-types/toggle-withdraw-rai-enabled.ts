import { z } from "zod";

export const toggleWithdrawRaiEnabledSchema = z.object({
  raiWithdrawEnabled: z.boolean(),
});
export type WithdrawRecord = z.infer<typeof toggleWithdrawRaiEnabledSchema>;
