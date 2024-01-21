import { withdrawPackageSchema } from "./../../../action-types";
export const transformWithdrawPackage = (id: string) => {
  // This does nothing.  Just putting the mechanics in place.
  return withdrawPackageSchema.transform((data) => ({
    id,
    raiWithdrawEnabled: false,
  }));
};
