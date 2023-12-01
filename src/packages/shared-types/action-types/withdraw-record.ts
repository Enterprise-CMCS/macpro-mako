import { z } from "zod";
import { onemacAttachmentSchema } from "../onemac";

export const withdrawRaiSchema = z.object({
  id: z.string(),
  submitterName: z.string(),
  submitterEmail: z.string(),
  attachments: z.array(onemacAttachmentSchema.nullable()).nullish(),
  withdrawDate: z.number(),
  additionalInformation: z.string(),
});

export const raiActionSchema = z.object({
  id: z.string(),
  submitterName: z.string(),
  submitterEmail: z.string(),
  rais: z.record(z.string(), z.object({ response: z.null() })),
});

export const raiTransform = (activeKey: number) =>
  withdrawRaiSchema.transform((data) => ({
    id: data.id,
    submitterName: data.submitterName,
    submitterEmail: data.submitterEmail,
    rais: {
      [activeKey]: {
        response: null,
      },
    },
  }));

export const withdrawRecordSchema = z.object({
  raiWithdrawEnabled: z.boolean(),
});

export type WithdrawRaiRecord = z.infer<typeof withdrawRaiSchema>;
export type WithdrawRecord = z.infer<typeof withdrawRecordSchema>;
export type WithdrawSinkRecord = z.infer<typeof raiActionSchema>;
