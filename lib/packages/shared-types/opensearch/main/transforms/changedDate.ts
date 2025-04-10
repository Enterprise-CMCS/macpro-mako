import { seatoolRecordWithUpdatedDateSchema } from "../../../seatool-tables";

export const transform = () => {
  return seatoolRecordWithUpdatedDateSchema.transform((data) => ({
    id: data.ID_Number,
    changedDate:
      typeof data.Changed_Date === "number" ? new Date(data.Changed_Date).toISOString() : null,
  }));
};

export type Schema = ReturnType<typeof transform>;
