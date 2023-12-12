import { z } from "zod";

export const toggleWithdrawRaiEnabledSchema = z.object({
  authority: z.string(),
  origin: z.string(),
  raiWithdrawEnabled: z.boolean(),
});
export type ToggleWithdrawRaiEnabled = z.infer<
  typeof toggleWithdrawRaiEnabledSchema
>;
