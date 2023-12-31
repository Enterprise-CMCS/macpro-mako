import { z } from "zod";
import { onemacAttachmentSchema, handleAttachment } from "../attachments";

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
    raiWithdrawEnabled: false,
    rais: {
      [data.requestedDate]: {
        withdraw: {
          attachments:
            data.attachments?.map((attachment) => {
              return handleAttachment(attachment);
            }) ?? null,
          additionalInformation: data.additionalInformation,
          submitterName: data.submitterName,
          submitterEmail: data.submitterEmail,
        },
      },
    },
  }));
};
export type RaiWithdrawTransform = z.infer<
  ReturnType<typeof transformRaiWithdraw>
>;
