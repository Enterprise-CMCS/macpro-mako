import { raiWithdrawSchema } from "./../../../action-types";
export const transformRaiWithdraw = (id: string) => {
  return raiWithdrawSchema.transform((data) => ({
    id,
    raiWithdrawEnabled: false,
  }));
};
