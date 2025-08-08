import { z } from "zod";

import { sharedSchema } from "./base-schema";

export const baseSchema = z.object({
  splitCount: z.string().regex(/^[2-8]$/),
  spaIds: z
    .array(
      z.object({
        suffix: z.string().min(1, "Suffix is required"),
      }),
    )
    .min(2)
    .max(8),
  requestor: z.string().min(1),
});

export const schema = baseSchema.merge(sharedSchema);
