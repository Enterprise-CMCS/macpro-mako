import { z } from "zod";

// This is the event schema for ne submissions from our system
export const performIntakeSchema = z.object({
  subject: z
    .string()
    .trim()
    .min(1, { message: "Required" })
    .max(120, { message: "Subject should be under 120 characters" })
    .default(""),
  description: z
    .string()
    .trim()
    .min(1, { message: "Required" })
    .max(4000, { message: "Description should be under 4000 characters" }),
  typeIds: z.array(z.number()).min(1, { message: "Required" }),
  subTypeIds: z.array(z.number()).min(1, { message: "Required" }),
  cpoc: z.number().min(1, { message: "CPOC is required" }),
});

export type PerformIntake = z.infer<typeof performIntakeSchema>;
