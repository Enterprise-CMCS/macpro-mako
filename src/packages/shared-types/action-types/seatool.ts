import { z } from "zod";

const zActionOfficer = z.object({
  OFFICER_ID: z.number(),
  FIRST_NAME: z.string(),
  LAST_NAME: z.string(),
});

export const seatoolSchema = z.object({
  ACTION_OFFICERS: z.array(zActionOfficer).nullish(),
  LEAD_ANALYST: z.array(zActionOfficer).nullable(),
  PLAN_TYPES: z
    .array(
      z.object({
        PLAN_TYPE_NAME: z.string(),
      })
    )
    .nonempty()
    .nullable(),
  STATE_PLAN: z.object({
    SUBMISSION_DATE: z.number().nullable(),
    PLAN_TYPE: z.number().nullable(),
    LEAD_ANALYST_ID: z.number().nullable(),
    CHANGED_DATE: z.number().nullable(),
    APPROVED_EFFECTIVE_DATE: z.number().nullable(),
    PROPOSED_DATE: z.number().nullable(),
    SPW_STATUS_ID: z.number().nullable(),
    STATE_CODE: z.string().nullish(),
    STATUS_DATE: z.number().nullish(),
    SUMMARY_MEMO: z.string().nullish(),
    TITLE_NAME: z.string().nullish(),
  }),
  SPW_STATUS: z
    .array(
      z.object({
        SPW_STATUS_DESC: z.string().nullable(),
        SPW_STATUS_ID: z.number().nullable(),
      })
    )
    .nullable(),
  RAI: z
    .array(
      z.object({
        RAI_RECEIVED_DATE: z.number().nullable(),
        RAI_REQUESTED_DATE: z.number().nullable(),
        RAI_WITHDRAWN_DATE: z.number().nullable(),
      })
    )
    .nullable(),
  ACTIONTYPES: z
    .array(
      z.object({
        ACTION_ID: z.number(),
        ACTION_NAME: z.string(),
        PLAN_TYPE_ID: z.number(),
      })
    )
    .nullable(),
});
export type SeaTool = z.infer<typeof seatoolSchema>;
