import {
  seatoolSchema,
  SEATOOL_STATUS,
  getStatus,
  finalDispositionStatuses,
  SeaTool,
  SeatoolOfficer,
} from "../../..";

import { PlanType } from "../../../planType";

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

function getLeadAnalyst(eventData: SeaTool) {
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

const getRaiDate = (data: SeaTool) => {
  let raiReceivedDate: null | string = null;
  let raiRequestedDate: null | string = null;
  let raiWithdrawnDate: null | string = null;

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
  if (raiDate && raiDate.RAI_WITHDRAWN_DATE) {
    raiWithdrawnDate = new Date(raiDate.RAI_WITHDRAWN_DATE).toISOString();
  }
  return {
    raiReceivedDate,
    raiRequestedDate,
    raiWithdrawnDate,
  };
};

const getDateStringOrNullFromEpoc = (epocDate: number | null | undefined) =>
  epocDate !== null && epocDate !== undefined
    ? new Date(epocDate).toISOString()
    : null;

const compileSrtList = (
  officers: SeatoolOfficer[] | null | undefined
): string[] =>
  officers?.length ? officers.map((o) => `${o.FIRST_NAME} ${o.LAST_NAME}`) : [];

const getFinalDispositionDate = (status: string, record: SeaTool) => {
  return status && finalDispositionStatuses.includes(status)
    ? getDateStringOrNullFromEpoc(record.STATE_PLAN.STATUS_DATE)
    : null;
};

const isInSecondClock = (
  raiReceivedDate: any,
  seatoolStatus: any,
  authority: any
) => {
  if (
    authority != "CHIP" && // if it's not a chip
    [
      SEATOOL_STATUS.PENDING,
      SEATOOL_STATUS.PENDING_CONCURRENCE,
      SEATOOL_STATUS.PENDING_APPROVAL,
    ].includes(seatoolStatus) && // if it's in pending
    raiReceivedDate // if its latest rai has a received date
  ) {
    return true; // then we're in second clock
  }
  return false; // otherwise, we're not
};

export const transform = (id: string) => {
  return seatoolSchema.transform((data) => {
    const { leadAnalystName, leadAnalystOfficerId } = getLeadAnalyst(data);
    const { raiReceivedDate, raiRequestedDate, raiWithdrawnDate } =
      getRaiDate(data);
    const seatoolStatus =
      data.SPW_STATUS?.find(
        (item) => item.SPW_STATUS_ID === data.STATE_PLAN.SPW_STATUS_ID
      )?.SPW_STATUS_DESC || "Unknown";
    const { stateStatus, cmsStatus } = getStatus(seatoolStatus);
    return {
      id,
      actionType: data.ACTIONTYPES?.[0].ACTION_NAME,
      actionTypeId: data.ACTIONTYPES?.[0].ACTION_ID,
      approvedEffectiveDate: getDateStringOrNullFromEpoc(
        data.STATE_PLAN.APPROVED_EFFECTIVE_DATE
      ),
      authority: authorityLookup(data.STATE_PLAN.PLAN_TYPE),
      changedDate: getDateStringOrNullFromEpoc(data.STATE_PLAN.CHANGED_DATE),
      description: data.STATE_PLAN.SUMMARY_MEMO,
      finalDispositionDate: getFinalDispositionDate(seatoolStatus, data),
      leadAnalystOfficerId,
      leadAnalystName,
      planType: data.PLAN_TYPES?.[0].PLAN_TYPE_NAME as PlanType | null,
      planTypeId: data.STATE_PLAN.PLAN_TYPE,
      proposedDate: getDateStringOrNullFromEpoc(data.STATE_PLAN.PROPOSED_DATE),
      raiReceivedDate,
      raiRequestedDate,
      raiWithdrawnDate,
      reviewTeam: compileSrtList(data.ACTION_OFFICERS),
      state: data.STATE_PLAN.STATE_CODE,
      stateStatus: stateStatus || SEATOOL_STATUS.UNKNOWN,
      statusDate: getDateStringOrNullFromEpoc(data.STATE_PLAN.STATUS_DATE),
      cmsStatus: cmsStatus || SEATOOL_STATUS.UNKNOWN,
      seatoolStatus,
      submissionDate: getDateStringOrNullFromEpoc(
        data.STATE_PLAN.SUBMISSION_DATE
      ),
      subject: data.STATE_PLAN.TITLE_NAME,
      secondClock: isInSecondClock(
        raiReceivedDate,
        seatoolStatus,
        authorityLookup(data.STATE_PLAN.PLAN_TYPE)
      ),
    };
  });
};
export type Schema = ReturnType<typeof transform>;
