import { raiWithdrawSchema } from "./../../../action-types";
export const raiWithdraw = (id: string) => {
  return raiWithdrawSchema.transform((data) => ({
    id,
    raiWithdrawEnabled: false,
  }));
};
