import { z } from "zod";

type AuthorityType = "SPA" | "WAIVER";

const planTypeLookup = (val: number | null): null | string => {
  if (!val) return null;

  const lookup: Record<number, string> = {
    121: "1115",
    122: "1915b_waivers",
    123: "1915c_waivers",
    124: "CHIP_SPA",
    125: "Medicaid_SPA",
    126: "1115_Indep_Plus",
    127: "1915c_Indep_Plus",
    130: "UPL",
  };

  return lookup[val];
};

const authorityLookup = (val: number | null): null | string => {
  if (!val) return null;

  const lookup: Record<number, AuthorityType> = {
    122: "WAIVER",
    123: "WAIVER",
    124: "SPA",
    125: "SPA",
  };

  return lookup[val];
};

export const seatoolSchema = z.object({
  STATES: z
    .array(
      z.object({
        STATE_CODE: z.string(),
        STATE_NAME: z.string(),
        REGION_ID: z.string(),
        PRIORITY_FLAG: z.boolean(),
      })
    )
    .nonempty(),
  PLAN_TYPES: z
    .array(
      z.object({
        PLAN_TYPE_NAME: z.string(),
      })
    )
    .nonempty()
    .nullable(),
  STATE_PLAN: z.object({
    SUBMISSION_DATE: z.number(),
    PLAN_TYPE: z.number().nullable(),
  }),
  RAI: z
    .array(
      z.object({
        RAI_RECEIVED_DATE: z.number(),
        RAI_REQUESTED_DATE: z.number(),
      })
    )
    .nullable(),
});

export const transformSeatoolData = (id: string) => {
  return seatoolSchema.transform((data) => ({
    id,
    planTypeId: data.STATE_PLAN.PLAN_TYPE,
    planType: planTypeLookup(data.STATE_PLAN.PLAN_TYPE),
    authority: authorityLookup(data.STATE_PLAN.PLAN_TYPE),
    state: data.STATES[0].STATE_CODE,
    submissionDate: data.STATE_PLAN.SUBMISSION_DATE,
    rai_received_date:
      data.RAI?.sort((a, b) => a.RAI_REQUESTED_DATE - b.RAI_REQUESTED_DATE)[
        data.RAI.length - 1
      ] ?? null,
  }));
};

export type SeaToolTransform = z.infer<ReturnType<typeof transformSeatoolData>>;
export type SeaToolSink = z.infer<typeof seatoolSchema>;
