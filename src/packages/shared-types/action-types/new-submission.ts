import { z } from "zod";
import { attachmentSchema } from "../attachments";

// This is the event schema for ne submissions from our system
export const onemacSchema = z.object({
  authority: z.string(),
  seaActionType: z.string().optional(), // Used by waivers and chip spas
  origin: z.string(),
  appkParentId: z.string().nullable().default(null),
  originalWaiverNumber: z.string().nullable().default(null),
  additionalInformation: z.string().nullable().default(null),
  submitterName: z.string(),
  submitterEmail: z.string(),
  attachments: z.array(attachmentSchema).nullish(),
  raiWithdrawEnabled: z.boolean().default(false),
  notificationMetadata: z
    .object({
      proposedEffectiveDate: z.number().nullish(),
      submissionDate: z.number().nullish(),
    })
    .nullish(),
  // these are specific to TEs... should be broken into its own schema
  statusDate: z.number().optional(),
  submissionDate: z.number().optional(),
  changedDate: z.number().optional(),
});

export type OneMac = z.infer<typeof onemacSchema>;
