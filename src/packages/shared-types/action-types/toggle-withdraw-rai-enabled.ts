import { z } from "zod";

export const toggleWithdrawRaiEnabledSchema = z.object({
  raiWithdrawEnabled: z.boolean(),
});
export type ToggleWithdraRaiEnabled = z.infer<
  typeof toggleWithdrawRaiEnabledSchema
>;
