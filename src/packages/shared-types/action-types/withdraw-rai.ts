import { z } from "zod";
import { attachmentSchema } from "../attachments";

export const raiWithdrawSchema = z.object({
  id: z.string(),
  authority: z.string(),
  origin: z.string(),
  requestedDate: z.number(),
  withdrawnDate: z.number(),
  attachments: z.array(attachmentSchema).nullish(),
  additionalInformation: z.string().nullable().default(null),
  submitterName: z.string(),
  submitterEmail: z.string(),
});
export type RaiWithdraw = z.infer<typeof raiWithdrawSchema>;
