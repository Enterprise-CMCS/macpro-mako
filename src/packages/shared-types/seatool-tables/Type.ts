import { z } from "zod";

export const seaSubTypeSchema = z.object({
  Type_Id: z.number(),
  Type_Name: z.string(),
  Type_Class: z.number().nullish(),
  Plan_Type_ID: z.number().nullish(),
});
export type SeaSubType = z.infer<typeof seaSubTypeSchema>;
