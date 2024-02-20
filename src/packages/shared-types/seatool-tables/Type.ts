import { z } from "zod";

export const seaSubtypeSchema = z.object({
  Type_Id: z.number(),
  Type_Name: z.string(),
  Type_Class: z.number().nullish(),
  Plan_Type_ID: z.number().nullish(),
});
export type SeaSubtype = z.infer<typeof seaSubtypeSchema>;
