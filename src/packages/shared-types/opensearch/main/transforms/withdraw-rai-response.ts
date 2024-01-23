import { raiWithdrawSchema } from "../../..";

export const transform = (id: string) => {
  return raiWithdrawSchema.transform(() => ({
    id,
    raiWithdrawEnabled: false,
  }));
};

export type Schema = ReturnType<typeof transform>;
