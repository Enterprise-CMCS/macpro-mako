import { withdrawPackageSchema } from "..";

export const transform = (id: string) => {
  // This does nothing.  Just putting the mechanics in place.
  return withdrawPackageSchema.transform(() => ({
    id,
    raiWithdrawEnabled: false,
  }));
};

export type Schema = ReturnType<typeof transform>;
