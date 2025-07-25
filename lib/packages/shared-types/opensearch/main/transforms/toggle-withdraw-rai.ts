import { events } from "../../../index";

// transform used to take in id: string
export const transform = () => {
  return events["toggle-withdraw-rai"].schema.transform((data) => ({
    id: data.id,
    raiWithdrawEnabled: data.raiWithdrawEnabled,
    makoChangedDate: data.timestamp ? new Date(data.timestamp).toISOString() : null,
  }));
};

export type Schema = ReturnType<typeof transform>;
