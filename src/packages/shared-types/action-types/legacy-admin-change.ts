import { z } from "zod";

// A schema for legacy admin changes
export const legacyAdminChange = z.object({
  changeTimestamp: z.number(),
  changeMade: z.string(),
  changeReason: z.string().optional().default(""),
});
