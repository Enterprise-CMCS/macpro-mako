import { toggleWithdrawRaiEnabledSchema } from "../../..";

export const transform = (id: string) => {
  return toggleWithdrawRaiEnabledSchema.transform((data) => ({
    id,
    raiWithdrawEnabled: data.raiWithdrawEnabled,
  }));
};

export type Schema = ReturnType<typeof transform>;
