import { z } from "zod";

export const seatoolRecordWithUpdatedDateSchema = z.object({
  ID_Number: z.string(),
  Changed_Date: z.number().nullable(),
});

export type SeatoolRecordWithUpdatedDate = z.infer<typeof seatoolRecordWithUpdatedDateSchema>;
