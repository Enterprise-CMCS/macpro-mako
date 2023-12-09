import { z } from "zod";

export const toggleWithdrawRaiEnabledSchema = z.object({
  raiWithdrawEnabled: z.boolean(),
});
export type ToggleWithdrawRaiEnabled = z.infer<
  typeof toggleWithdrawRaiEnabledSchema
>;
