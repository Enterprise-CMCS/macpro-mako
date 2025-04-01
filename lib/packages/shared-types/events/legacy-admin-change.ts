import { z } from "zod";

// A schema for legacy admin changes
export const legacyAdminChangeSchema = z.object({
  changeTimestamp: z.number(),
  changeType: z.string().nullish().default("legacy-admin-change"),
  changeMade: z.string(),
  changeReason: z.string().optional().default(""),
  // isAdminChange: z.boolean(),
});

export type LegacyAdminChange = z.infer<typeof legacyAdminChangeSchema>;
