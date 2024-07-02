import { toggleWithdrawRaiEnabledSchema } from "../../..";

export const transform = (id: string) => {
  return toggleWithdrawRaiEnabledSchema.transform((data) => ({
    id,
    raiWithdrawEnabled: data.raiWithdrawEnabled,
    makoChangedDate: new Date(data.timestamp).toISOString(),
  }));
};

export type Schema = ReturnType<typeof transform>;
