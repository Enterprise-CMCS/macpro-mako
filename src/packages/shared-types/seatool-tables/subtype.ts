import { z } from "zod";

export const seaSubTypeSchema = z.object({
  Type_Id: z.number(),
  Type_Name: z.string(),
  Type_Class: z.number().optional(),
  Plan_Type_ID: z.number().optional(),
});
export type SeaSubTypeSchema = z.infer<typeof seaSubTypeSchema>;
