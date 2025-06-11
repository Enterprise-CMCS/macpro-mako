import { z } from "zod";

export const sharedSchema = z.object({
  origin: z.literal("mako").default("mako"),
  submitterName: z.string(),
  submitterEmail: z.string().email(),
  timestamp: z.number(),
  chipEligibility: z.preprocess((val) => val ?? false, z.boolean()),
  chipSubmissionType: z.array(z.string()).optional().default([]),
});

export const ammendSchema = sharedSchema.extend({
  actionType: z.string().default("Amend"),
});
export const renewSchema = sharedSchema.extend({
  actionType: z.string().default("Renew"),
});
export const initialSchema = sharedSchema.extend({
  actionType: z.string().default("Initial"),
});
export const extendSchema = sharedSchema.extend({
  actionType: z.string().default("Extend"),
});
