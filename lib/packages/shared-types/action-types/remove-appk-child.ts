import { z } from "zod";

export const removeAppkChildSchema = z.object({
  id: z.string(),
  authority: z.string(),
  origin: z.string(),
  appkParentId: z.string(),
  submitterName: z.string(),
  submitterEmail: z.string(),
  timestamp: z.number().optional(),
});
export type RemoveAppkChild = z.infer<typeof removeAppkChildSchema>;
