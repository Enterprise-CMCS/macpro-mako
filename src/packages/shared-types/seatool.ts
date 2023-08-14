import { z } from "zod";

type AuthorityType = "SPA" | "WAIVER" | "MEDICAID" | "CHIP";

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
    124: "CHIP",
    125: "MEDICAID",
  };

  return lookup[val];
};

function getLeadAnalyst(eventData: SeaToolSink) {
  if (
    eventData.LEAD_ANALYST &&
    Array.isArray(eventData.LEAD_ANALYST) &&
    eventData.STATE_PLAN.LEAD_ANALYST_ID
  ) {
    const leadAnalyst = eventData.LEAD_ANALYST.find(
      (analyst) => analyst.OFFICER_ID === eventData.STATE_PLAN.LEAD_ANALYST_ID
    );
    console.log("the lead analsyt is: ", leadAnalyst);

    if (leadAnalyst) return leadAnalyst; // {FIRST_NAME: string, LAST_NAME: string}
  }
  return null;
}

const getReceivedDate = (data: SeaToolSink) => {
  return (
    data.RAI?.sort((a, b) => {
      if (a.RAI_REQUESTED_DATE === null && b.RAI_REQUESTED_DATE === null) {
        return 0; // Both dates are null, so they're considered equal
      }
      if (a.RAI_REQUESTED_DATE === null) {
        return 1; // a comes after b because its date is null
      }
      if (b.RAI_REQUESTED_DATE === null) {
        return -1; // b comes after a because its date is null
      }
      return a.RAI_REQUESTED_DATE - b.RAI_REQUESTED_DATE; // Normal comparison
    })[data.RAI.length - 1] ?? null
  );
};

export const seatoolSchema = z.object({
  LEAD_ANALYST: z
    .array(
      z.object({
        OFFICER_ID: z.number(),
        FIRST_NAME: z.string(),
        LAST_NAME: z.string(),
      })
    )
    .nullable(),
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
    LEAD_ANALYST_ID: z.number().nullable(),
  }),
  RAI: z
    .array(
      z.object({
        RAI_RECEIVED_DATE: z.number().nullable(),
        RAI_REQUESTED_DATE: z.number().nullable(),
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
    rai_received_date: getReceivedDate(data),
    lead_analyst: getLeadAnalyst(data),
  }));
};

export type SeaToolTransform = z.infer<ReturnType<typeof transformSeatoolData>>;
export type SeaToolSink = z.infer<typeof seatoolSchema>;
