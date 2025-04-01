import { z } from "zod";

import { Action } from "..";

// A schema for legacy admin changes
export const legacyAdminChangeSchema = z
  .object({
    pk: z.string(),
    changeTimestamp: z.number(),
    changeType: z.string().nullish(),
    changeMade: z.string(),
    changeReason: z.string().optional().default(""),
    isAdminChange: z.boolean().default(true),
    event: z.string().default(Action.LEGACY_ADMIN_CHANGE),
  })
  .transform((data) => ({
    ...data,
    id: data.pk,
  }));

export type LegacyAdminChange = z.infer<typeof legacyAdminChangeSchema>;
