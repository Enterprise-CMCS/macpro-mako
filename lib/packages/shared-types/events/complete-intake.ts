import { z } from "zod";

// This is the event schema for intake performed from our system
export const completeIntakeSchema = z.object({
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
  timestamp: z.number().optional(),
});

export type CompleteIntake = z.infer<typeof completeIntakeSchema>;
