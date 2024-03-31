import { z } from "zod";

// This is the event schema for intake performed from our system
export const performIntakeSchema = z.object({
  id: z.string(),
  authority: z.string(),
  origin: z.string(),
  submitterName: z.string(),
  submitterEmail: z.string(),
  subject: z.string(),
  description: z.string(),
  typeIds: z.array(z.number()),
  subTypeIds: z.array(z.number()),
  cpoc: z.number(),
});

export type PerformIntake = z.infer<typeof performIntakeSchema>;
