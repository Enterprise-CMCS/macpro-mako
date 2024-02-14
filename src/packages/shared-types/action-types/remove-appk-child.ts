import { z } from "zod";

export const removeAppkChildSchema = z.object({
  id: z.string(),
  authority: z.string(),
  appkParentId: z.string().nullable().default(null),
  isAppkParent: z.boolean().default(false),
  submitterName: z.string(),
  submitterEmail: z.string(),
});
export type RemoveAppkChild = z.infer<typeof removeAppkChildSchema>;
