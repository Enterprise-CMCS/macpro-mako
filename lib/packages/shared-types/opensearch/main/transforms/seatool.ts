import {
  seatoolSchema,
  SEATOOL_STATUS,
  getStatus,
  finalDispositionStatuses,
  SeaTool,
  SeatoolOfficer,
  SEATOOL_SPW_STATUS,
} from "../../..";

import { Authority, SEATOOL_AUTHORITIES } from "shared-types";

function getLeadAnalyst(eventData: SeaTool) {
  let leadAnalystOfficerId: null | number = null;
  let leadAnalystName: null | string = null;
  let leadAnalystEmail: null | string = null;
  if (
    eventData.LEAD_ANALYST &&
    Array.isArray(eventData.LEAD_ANALYST) &&
    eventData.STATE_PLAN.LEAD_ANALYST_ID
  ) {
    const leadAnalyst = eventData.LEAD_ANALYST.find(
      (analyst) => analyst.OFFICER_ID === eventData.STATE_PLAN.LEAD_ANALYST_ID,
    );

    if (leadAnalyst) {
      leadAnalystOfficerId = leadAnalyst.OFFICER_ID;
      leadAnalystName = `${leadAnalyst.FIRST_NAME} ${leadAnalyst.LAST_NAME}`;
      leadAnalystEmail = leadAnalyst.EMAIL;
    }
  }
  return {
    leadAnalystOfficerId,
    leadAnalystName,
    leadAnalystEmail,
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
  officers: SeatoolOfficer[] | null | undefined,
): { name: string; email: string }[] =>
  officers?.length
    ? officers.map((o) => ({
        name: `${o.FIRST_NAME} ${o.LAST_NAME}`,
        email: o.EMAIL,
      }))
    : [];

const getFinalDispositionDate = (status: string, record: SeaTool) => {
  return status && finalDispositionStatuses.includes(status)
    ? getDateStringOrNullFromEpoc(record.STATE_PLAN.STATUS_DATE)
    : null;
};

const isInSecondClock = (
  raiReceivedDate: any,
  raiWithdrawnDate: any,
  seatoolStatus: any,
  authority: any,
) => {
  if (
    authority != Authority.CHIP_SPA && // if it's not a chip
    [
      SEATOOL_STATUS.PENDING,
      SEATOOL_STATUS.PENDING_CONCURRENCE,
      SEATOOL_STATUS.PENDING_APPROVAL,
    ].includes(seatoolStatus) && // if it's in pending
    raiReceivedDate && // if its latest rai has a received date
    !raiWithdrawnDate // if the latest rai has not been withdrawn
  ) {
    return true; // then we're in second clock
  }
  return false; // otherwise, we're not
};

const getAuthority = (authorityId: number | null) => {
  try {
    if (!authorityId) return null;
    return SEATOOL_AUTHORITIES[authorityId];
  } catch (error) {
    console.log(`SEATOOL AUTHORITY LOOKUP ERROR: ${authorityId}`);
    console.log(error);
    return null;
  }
};

export const transform = (id: string) => {
  return seatoolSchema.transform((data) => {
    const { leadAnalystName, leadAnalystOfficerId, leadAnalystEmail } =
      getLeadAnalyst(data);
    const { raiReceivedDate, raiRequestedDate, raiWithdrawnDate } =
      getRaiDate(data);
    const seatoolStatus = data.STATE_PLAN.SPW_STATUS_ID
      ? SEATOOL_SPW_STATUS[data.STATE_PLAN.SPW_STATUS_ID]
      : "Unknown";
    const { stateStatus, cmsStatus } = getStatus(seatoolStatus);
    const resp = {
      id,
      actionType: data.ACTIONTYPES?.[0].ACTION_NAME,
      approvedEffectiveDate: getDateStringOrNullFromEpoc(
        data.STATE_PLAN.APPROVED_EFFECTIVE_DATE ||
          data.STATE_PLAN.ACTUAL_EFFECTIVE_DATE,
      ),
      changed_date: data.STATE_PLAN.CHANGED_DATE,
      description: data.STATE_PLAN.SUMMARY_MEMO,
      finalDispositionDate: getFinalDispositionDate(seatoolStatus, data),
      leadAnalystOfficerId,
      leadAnalystEmail,
      initialIntakeNeeded:
        !leadAnalystName && !finalDispositionStatuses.includes(seatoolStatus),
      leadAnalystName,
      authority: getAuthority(data.STATE_PLAN?.PLAN_TYPE) as Authority | null,
      types:
        data.STATE_PLAN_SERVICETYPES?.filter(
          (type): type is NonNullable<typeof type> => type != null,
        ).map((type) => {
          return {
            SPA_TYPE_ID: type.SPA_TYPE_ID,
            SPA_TYPE_NAME: type.SPA_TYPE_NAME.replace(/â|â/g, "-"),
          };
        }) || null,
      subTypes:
        data.STATE_PLAN_SERVICE_SUBTYPES?.filter(
          (subType): subType is NonNullable<typeof subType> => subType != null,
        ).map((subType) => {
          return {
            TYPE_ID: subType.TYPE_ID,
            TYPE_NAME: subType.TYPE_NAME.replace(/â|â/g, "-"),
          };
        }) || null,
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
      locked: false,
      submissionDate: getDateStringOrNullFromEpoc(
        data.STATE_PLAN.SUBMISSION_DATE,
      ),
      subject: data.STATE_PLAN.TITLE_NAME,
      secondClock: isInSecondClock(
        raiReceivedDate,
        raiWithdrawnDate,
        seatoolStatus,
        getAuthority(data.STATE_PLAN.PLAN_TYPE),
      ),
      raiWithdrawEnabled: finalDispositionStatuses.includes(seatoolStatus)
        ? false
        : undefined,
    };
    return resp;
  });
};
export type Schema = ReturnType<typeof transform>;
export const tombstone = (id: string) => {
  return {
    id,
    actionType: null,
    approvedEffectiveDate: null,
    changedDate: null,
    description: null,
    finalDispositionDate: null,
    leadAnalystName: null,
    leadAnalystOfficerId: null,
    authority: null,
    proposedDate: null,
    raiReceivedDate: null,
    raiRequestedDate: null,
    raiWithdrawnDate: null,
    reviewTeam: null,
    state: null,
    cmsStatus: null,
    stateStatus: null,
    seatoolStatus: null,
    statusDate: null,
    submissionDate: null,
    subject: null,
    types: null,
    subTypes: null,
  };
};
