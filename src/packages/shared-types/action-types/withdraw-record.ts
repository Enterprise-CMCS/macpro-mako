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

export const raiTransform = (activeKey: number) =>
  withdrawRaiSchema.transform((data) => ({
    ...data,
    rais: {
      [activeKey]: {
        response: null,
      },
    },
  }));

export const withdrawRaiSinkSchema = withdrawRaiSchema.and(
  z.object({ rais: z.record(z.number(), z.object({ response: z.null() })) })
);

export const withdrawRecordSchema = z.object({
  raiWithdrawEnabled: z.boolean(),
});

export type WithdrawRaiRecord = z.infer<typeof withdrawRaiSchema>;
export type WithdrawRecord = z.infer<typeof withdrawRecordSchema>;
export type WithdrawSinkRecord = z.infer<typeof withdrawRaiSinkSchema>;

// const test: WithdrawSinkRecord = {
//   id: "",
//   submitterEmail: "",
//   submitterName: "",
//   withdraw: {
//     withdrawDate: 123,
//     additionalInformation: "",
//     withdrawAttachments: [],
//   },
//   rais: {
//     123: {
//       response: null,
//     },
//   },
// };
