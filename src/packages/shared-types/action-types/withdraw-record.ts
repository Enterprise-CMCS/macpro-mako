import { z } from "zod";
import { onemacAttachmentSchema } from "../onemac";

export const withdrawRaiSchema = z.object({
  id: z.string(),
  submitterName: z.string(),
  submitterEmail: z.string(),
  attachments: z.array(onemacAttachmentSchema.nullable()).nullish(),
  withdraw: z.object({
    withdrawDate: z.number(),
    additionalInformation: z.string().nullish(),
  }),
});

export const raiActionSchema = z.object({
  id: z.string(),
  submitterName: z.string(),
  submitterEmail: z.string(),
  withdraw: z.object({
    withdrawDate: z.number(),
    additionalInformation: z.string().nullish(),
    attachments: z.array(onemacAttachmentSchema.nullable()).nullish(),
  }),
});

export const raiTransform = (activeKey: number) =>
  withdrawRaiSchema.transform((data) => ({
    id: data.id,
    submitterName: data.submitterName,
    submitterEmail: data.submitterEmail,
    withdraw: {
      ...data.withdraw,
      attachments: [...data.attachments],
    },
    rais: {
      [activeKey]: {
        response: null,
      },
    },
  }));

export const withdrawRaiSinkSchema = raiActionSchema.and(
  z.object({ rais: z.record(z.number(), z.object({ response: z.null() })) })
);

export const withdrawRecordSchema = z.object({
  raiWithdrawEnabled: z.boolean(),
});

export type WithdrawRaiRecord = z.infer<typeof withdrawRaiSchema>;
export type WithdrawRecord = z.infer<typeof withdrawRecordSchema>;
export type WithdrawSinkRecord = z.infer<typeof withdrawRaiSinkSchema>;
