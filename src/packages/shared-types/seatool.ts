import { z } from "zod";
import { SEATOOL_STATUS, getStatus } from "./statusHelper";

type AuthorityType = "SPA" | "WAIVER" | "MEDICAID" | "CHIP";

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
  let leadAnalystOfficerId: null | number = null;
  let leadAnalystName: null | string = null;

  if (
    eventData.LEAD_ANALYST &&
    Array.isArray(eventData.LEAD_ANALYST) &&
    eventData.STATE_PLAN.LEAD_ANALYST_ID
  ) {
    const leadAnalyst = eventData.LEAD_ANALYST.find(
      (analyst) => analyst.OFFICER_ID === eventData.STATE_PLAN.LEAD_ANALYST_ID
    );

    if (leadAnalyst) {
      leadAnalystOfficerId = leadAnalyst.OFFICER_ID;
      leadAnalystName = `${leadAnalyst.FIRST_NAME} ${leadAnalyst.LAST_NAME}`;
    }
  }
  return {
    leadAnalystOfficerId,
    leadAnalystName,
  };
}

const getRaiDate = (data: SeaToolSink) => {
  let raiReceivedDate: null | string = null;
  let raiRequestedDate: null | string = null;

  const raiDate =
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
    })[data.RAI.length - 1] ?? null;

  if (raiDate && raiDate.RAI_RECEIVED_DATE) {
    raiReceivedDate = new Date(raiDate.RAI_RECEIVED_DATE).toISOString();
  }
  if (raiDate && raiDate.RAI_REQUESTED_DATE) {
    raiRequestedDate = new Date(raiDate.RAI_REQUESTED_DATE).toISOString();
  }
  return {
    raiReceivedDate,
    raiRequestedDate,
  };
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
    SUBMISSION_DATE: z.number().nullable(),
    PLAN_TYPE: z.number().nullable(),
    LEAD_ANALYST_ID: z.number().nullable(),
    CHANGED_DATE: z.number().nullable(),
    APPROVED_EFFECTIVE_DATE: z.number().nullable(),
    PROPOSED_DATE: z.number().nullable(),
    SPW_STATUS_ID: z.number().nullable(),
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

const getDateStringOrNullFromEpoc = (epocDate: number | null) => {
  if (epocDate !== null) {
    return new Date(epocDate).toISOString();
  }
  return null;
};

export const transformSeatoolData = (id: string) => {
  return seatoolSchema.transform((data) => {
    const { leadAnalystName, leadAnalystOfficerId } = getLeadAnalyst(data);
    const { raiReceivedDate, raiRequestedDate } = getRaiDate(data);
    const { stateStatus, cmsStatus } = getStatus(
      data.SPW_STATUS?.find(
        (item) => item.SPW_STATUS_ID === data.STATE_PLAN.SPW_STATUS_ID
      )?.SPW_STATUS_DESC || "Unknown"
    );
    return {
      id,
      actionType: data.ACTIONTYPES?.[0].ACTION_NAME,
      actionTypeId: data.ACTIONTYPES?.[0].ACTION_ID,
      approvedEffectiveDate: getDateStringOrNullFromEpoc(
        data.STATE_PLAN.APPROVED_EFFECTIVE_DATE
      ),
      authority: authorityLookup(data.STATE_PLAN.PLAN_TYPE),
      changedDate: getDateStringOrNullFromEpoc(data.STATE_PLAN.CHANGED_DATE),
      leadAnalystOfficerId,
      leadAnalystName,
      planType: data.PLAN_TYPES?.[0].PLAN_TYPE_NAME,
      planTypeId: data.STATE_PLAN.PLAN_TYPE,
      proposedDate: getDateStringOrNullFromEpoc(data.STATE_PLAN.PROPOSED_DATE),
      raiReceivedDate,
      raiRequestedDate,
      state: data.STATES?.[0].STATE_CODE,
      stateStatus: stateStatus || SEATOOL_STATUS.UNKNOWN,
      cmsStatus: cmsStatus || SEATOOL_STATUS.UNKNOWN,
      submissionDate: getDateStringOrNullFromEpoc(
        data.STATE_PLAN.SUBMISSION_DATE
      ),
    };
  });
};

export type SeaToolTransform = z.infer<ReturnType<typeof transformSeatoolData>>;
export type SeaToolSink = z.infer<typeof seatoolSchema>;
export type SeaToolRecordsToDelete = Omit<
  {
    [Property in keyof SeaToolTransform]: undefined;
  },
  "id"
> & { id: string };
