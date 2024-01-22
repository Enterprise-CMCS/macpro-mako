import { toggleWithdrawRaiEnabledSchema } from "./../../../action-types";
export const toggleWithdrawRaiEnabled = (id: string) => {
  return toggleWithdrawRaiEnabledSchema.transform((data) => ({
    id,
    raiWithdrawEnabled: data.raiWithdrawEnabled,
  }));
};
