import { toggleWithdrawRaiEnabledSchema } from "../../..";

export const transform = (id: string) => {
  return toggleWithdrawRaiEnabledSchema.transform((data) => ({
    id,
    raiWithdrawEnabled: data.raiWithdrawEnabled,
    makoChangedDate: !!data.timestamp
      ? new Date(data.timestamp).toISOString()
      : null,
  }));
};

export type Schema = ReturnType<typeof transform>;
