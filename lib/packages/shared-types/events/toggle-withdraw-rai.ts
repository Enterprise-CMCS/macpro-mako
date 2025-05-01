import { z } from "zod";

import { sharedSchema } from "./base-schema";
export const baseSchema = z.object({
  event: z.literal("toggle-withdraw-rai").default("toggle-withdraw-rai"),
  id: z.string(),
  authority: z.string(),
  raiWithdrawEnabled: z.boolean(),
});

export const schema = baseSchema.merge(sharedSchema);
