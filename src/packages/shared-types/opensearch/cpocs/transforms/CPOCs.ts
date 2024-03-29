import { z } from "zod";

export const seaOfficersSchema = z.object({
  Officer_ID: z.number(),
  First_Name: z.string(),
  Last_Name: z.number(),
  Email: z.string().nullish(),
});

export type Schema = z.infer<typeof seaOfficersSchema>;
