import { toggleWithdrawRaiEnabledSchema } from "./../../../action-types";
export const transformToggleWithdrawRaiEnabled = (id: string) => {
  return toggleWithdrawRaiEnabledSchema.transform((data) => ({
    id,
    raiWithdrawEnabled: data.raiWithdrawEnabled,
  }));
};
