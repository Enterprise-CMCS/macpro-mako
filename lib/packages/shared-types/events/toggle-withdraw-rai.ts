import { z } from "zod";

// export const toggleWithdrawRaiEnabledSchema = z.object({
//   id: z.string(),
//   authority: z.string(),
//   origin: z.string(),
//   raiWithdrawEnabled: z.boolean(),
//   submitterName: z.string(),
//   submitterEmail: z.string(),
//   timestamp: z.number().optional(),
// });
// export type ToggleWithdrawRaiEnabled = z.infer<
//   typeof toggleWithdrawRaiEnabledSchema
// >;

export const baseSchema = z.object({
  id: z.string(),
  authority: z.string(),
  raiWithdrawEnabled: z.boolean(),
});

export const schema = baseSchema.extend({
  origin: z.literal("mako").default("mako"),
  submitterName: z.string(),
  submitterEmail: z.string().email(),
  timestamp: z.number().optional(),
});
