import { raiWithdrawSchema } from "../../..";

export const transform = (id: string) => {
  return raiWithdrawSchema.transform((data) => ({
    id,
    raiWithdrawEnabled: false,
    makoChangedDate: new Date(data.timestamp).toISOString(),
  }));
};

export type Schema = ReturnType<typeof transform>;
