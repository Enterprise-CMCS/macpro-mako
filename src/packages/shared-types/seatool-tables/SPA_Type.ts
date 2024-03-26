import { z } from "zod";

export const seaTypeSchema = z.object({
  SPA_Type_ID: z.number(),
  SPA_Type_Name: z.string(),
  Plan_Type_ID: z.number().nullish(),
});
export type SeaType = z.infer<typeof seaTypeSchema>;
