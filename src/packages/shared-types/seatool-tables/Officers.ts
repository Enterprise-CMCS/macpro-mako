import { z } from "zod";

export const seaOfficersSchema = z.object({
  Officer_ID: z.number(),
  First_Name: z.string(),
  Last_Name: z.string(),
  Email: z.string().nullish(),
});
export type SeaOfficersSchema = z.infer<typeof seaOfficersSchema>;
