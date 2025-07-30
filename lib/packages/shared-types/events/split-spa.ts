import { z } from "zod";

import { sharedSchema } from "./base-schema";

export const baseSchema = z.object({
  split: z.string().regex(/^[2-8]$/),
  spaIds: z.array(z.string()).min(2).max(8),
  requestor: z.string(),
});

export const schema = baseSchema.merge(sharedSchema);
