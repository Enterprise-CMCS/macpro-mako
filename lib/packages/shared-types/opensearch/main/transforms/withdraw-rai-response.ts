// import { schema } from "../../..";
import { events } from "shared-types";

export const transform = () => {
  return events["withdraw-rai"].schema.transform((data) => ({
    id: data.id,
    raiWithdrawEnabled: false,
    makoChangedDate: data.timestamp
      ? new Date(data.timestamp).toISOString()
      : null,
  }));
};

export type Schema = ReturnType<typeof transform>;
