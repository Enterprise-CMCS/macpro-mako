import { z } from "zod";

export const seaChangedDateSchema = z.object({
  ID_Number: z.string(),
  Changed_Date: z.number().nullable(),
});
export type SeaStatePlan = z.infer<typeof seaChangedDateSchema>;
