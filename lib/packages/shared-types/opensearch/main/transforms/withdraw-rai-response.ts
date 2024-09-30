import { raiWithdrawSchema } from "../../..";

export const transform = (id: string) => {
  return raiWithdrawSchema.transform((data) => ({
    id,
    raiWithdrawEnabled: false,
    // makoChangedDate: data.timestamp
    //   ? new Date(data.timestamp).toISOString()
    //   : null,
  }));
};

export type Schema = ReturnType<typeof transform>;
