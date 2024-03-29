import { z } from "zod";

// This is the event schema for ne submissions from our system
export const performIntakeSchema = z.object({
  timestamp: z.string().optional(), // Used by waivers and chip spas
  origin: z.string(),
  typeIds: z.array(z.number()).min(1),
  subTypeIds: z.array(z.number()).min(1),
  subject: z.string(),
  description: z.string(),
  // cpoc: z.string(), // or a number if using id... need the cpoc index first
  submitterName: z.string(),
  submitterEmail: z.string(),
});

export type PerformIntake = z.infer<typeof performIntakeSchema>;
