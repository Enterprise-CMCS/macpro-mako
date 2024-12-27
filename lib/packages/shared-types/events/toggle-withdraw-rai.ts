import { z } from "zod";


export const baseSchema = z.object({
  event: z.literal("toggle-withdraw-rai").default("toggle-withdraw-rai"),
  id: z.string(),
  authority: z.string(),
  raiWithdrawEnabled: z.boolean(),
});

export const schema = baseSchema.extend({
  origin: z.literal("mako").default("mako"),
  submitterName: z.string(),
  submitterEmail: z.string().email(),
  timestamp: z.number().optional(),
});
