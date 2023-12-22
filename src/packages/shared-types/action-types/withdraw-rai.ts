import { z } from "zod";
import { onemacAttachmentSchema } from "../attachments";

export const raiWithdrawSchema = z.object({
  id: z.string(),
  authority: z.string(),
  origin: z.string(),
  requestedDate: z.number(),
  withdrawnDate: z.number(),
  attachments: z.array(onemacAttachmentSchema).nullish(),
  additionalInformation: z.string().nullable().default(null),
  submitterName: z.string(),
  submitterEmail: z.string(),
});
export type RaiWithdraw = z.infer<typeof raiWithdrawSchema>;

export const transformRaiWithdraw = (id: string) => {
  return raiWithdrawSchema.transform((data) => ({
    id,
  }));
};
export type RaiWithdrawTransform = z.infer<
  ReturnType<typeof transformRaiWithdraw>
>;
