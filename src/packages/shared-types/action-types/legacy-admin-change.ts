import { z } from "zod";

// A schema for legacy admin changes
export const legacyAdminChangeSchema = z.object({
  changeTimestamp: z.number(),
  changeType: z.string().nullish(),
  changeMade: z.string(),
  changeReason: z.string().optional().default(""),
});

export type LegacyAdminChange = z.infer<typeof legacyAdminChangeSchema>;
