import { z } from "zod";

// A schema for legacy admin changes
export const legacyAdminChangeSchema = z
  .object({
    pk: z.string(),
    changeTimestamp: z.number(),
    changeType: z.string().nullish(),
    changeMade: z.string(),
    changeReason: z.string().optional().default(""),
    isAdminChange: z.boolean().default(true),
  })
  .transform((data) => ({
    ...data,
    id: data.pk,
  }));

export type LegacyAdminChange = z.infer<typeof legacyAdminChangeSchema>;
