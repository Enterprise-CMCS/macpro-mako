import { ONEMAC_LEGACY_ORIGIN } from ".";
import { getStatus, SEATOOL_STATUS } from "../../../..";
import { seaToolFriendlyTimestamp } from "../../../../../shared-utils/seatool-date-helper";

export const baseTransform = (data: any) => {
  const seatoolStatus = getSeaToolStatusFromLegacyStatus(data.currentStatus);
  const { stateStatus, cmsStatus } = getStatus(seatoolStatus);
  const timestampDate = new Date(data.eventTimestamp);
  const todayEpoch = seaToolFriendlyTimestamp(timestampDate);

  const isRaiResponseWithdrawEnabled = data.subStatus === "Withdraw Formal RAI Response Enabled";

  return {
    additionalInformation: data.additionalInformation,
    changedDate: timestampDate.toISOString(), // eventTimestamp as ISO string
    cmsStatus, // Derived status
    description: null, // Not provided in legacy, set to null
    id: data.pk, // pk becomes id
    makoChangedDate: timestampDate.toISOString(),
    origin: ONEMAC_LEGACY_ORIGIN,
    raiWithdrawEnabled: isRaiResponseWithdrawEnabled,
    seatoolStatus,
    state: data.pk?.split("-")?.[0], // Extract state from pk
    stateStatus,
    statusDate: new Date(data.eventTimestamp).toISOString(),
    proposedDate: isNaN(new Date(data.proposedEffectiveDate).getTime()) ? null : data.proposedEffectiveDate, // Handle non date convertible data as null
    subject: null,
    submissionDate: new Date(data.eventTimestamp).toISOString(),
    submitterEmail: data.submitterEmail,
    submitterName: data.submitterName,
    initialIntakeNeeded: true,
  };
};

function getSeaToolStatusFromLegacyStatus(legacyStatus: string | null | undefined) {
  if (!legacyStatus) {
    return SEATOOL_STATUS.UNKNOWN;
  }

  switch (legacyStatus.toUpperCase()) {
    case "Inactivated":
      return SEATOOL_STATUS.UNKNOWN;
    case "Submitted":
      return SEATOOL_STATUS.SUBMITTED;
    case "Under Review":
      return SEATOOL_STATUS.PENDING;
    case "Pending - Concurrence":
      return SEATOOL_STATUS.PENDING_CONCURRENCE;
    case "Pending - Approval":
      return SEATOOL_STATUS.PENDING_APPROVAL;
    case "RAI Issued":
      return SEATOOL_STATUS.PENDING_RAI;
    case "Approved":
      return SEATOOL_STATUS.APPROVED;
    case "Disapproved":
      return SEATOOL_STATUS.DISAPPROVED;
    case "Package Withdrawn":
      return SEATOOL_STATUS.WITHDRAWN;
    case "Withdrawal Requested":
      return SEATOOL_STATUS.WITHDRAW_REQUESTED;
    case "Waiver Terminated":
      return SEATOOL_STATUS.TERMINATED;
    case "Formal RAI Response - Withdrawal Requested":
      return SEATOOL_STATUS.RAI_RESPONSE_WITHDRAW_REQUESTED;
    default:
      return SEATOOL_STATUS.UNKNOWN;
  }
}