export const SEATOOL_STATUS = {
  PENDING: "Pending",
  PENDING_RAI: "Pending-RAI",
  APPROVED: "Approved",
  DISAPPROVED: "Disapproved",
  WITHDRAWN: "Withdrawn",
  TERMINATED: "Terminated",
  PENDING_CONCURRENCE: "Pending-Concurrence",
  UNSUBMITTED: "Unsubmitted",
  PENDING_APPROVAL: "Pending-Approval",
  UNKNOWN: "Unknown",
  PENDING_OFF_THE_CLOCK: "Pending-Off the Clock",
  SUBMITTED: "Submitted",
  RAI_RESPONSE_WITHDRAW_REQUESTED: "Formal RAI Response - Withdrawal Requested",
  WITHDRAW_REQUESTED: "Withdrawal Requested",
};

export const statusToDisplayToStateUser = {
  [SEATOOL_STATUS.PENDING]: "Under Review",
  [SEATOOL_STATUS.PENDING_RAI]: "RAI Issued",
  [SEATOOL_STATUS.APPROVED]: "Approved",
  [SEATOOL_STATUS.DISAPPROVED]: "Disapproved",
  [SEATOOL_STATUS.WITHDRAWN]: "Package Withdrawn",
  [SEATOOL_STATUS.TERMINATED]: "Terminated",
  [SEATOOL_STATUS.PENDING_CONCURRENCE]: "Under Review",
  [SEATOOL_STATUS.UNSUBMITTED]: "Unsubmitted",
  [SEATOOL_STATUS.PENDING_APPROVAL]: "Under Review",
  [SEATOOL_STATUS.PENDING_OFF_THE_CLOCK]: "Pending - Off the Clock",
  [SEATOOL_STATUS.SUBMITTED]: "Submitted",
  [SEATOOL_STATUS.RAI_RESPONSE_WITHDRAW_REQUESTED]: "Formal RAI Response - Withdrawal Requested",
  [SEATOOL_STATUS.WITHDRAW_REQUESTED]: "Withdrawal Requested",
};

export const statusToDisplayToCmsUser = {
  [SEATOOL_STATUS.PENDING]: "Pending",
  [SEATOOL_STATUS.PENDING_RAI]: "Pending - RAI",
  [SEATOOL_STATUS.APPROVED]: "Approved",
  [SEATOOL_STATUS.DISAPPROVED]: "Disapproved",
  [SEATOOL_STATUS.WITHDRAWN]: "Package Withdrawn",
  [SEATOOL_STATUS.TERMINATED]: "Terminated",
  [SEATOOL_STATUS.PENDING_CONCURRENCE]: "Pending - Concurrence",
  [SEATOOL_STATUS.UNSUBMITTED]: "Unsubmitted",
  [SEATOOL_STATUS.PENDING_APPROVAL]: "Pending - Approval",
  [SEATOOL_STATUS.PENDING_OFF_THE_CLOCK]: "Pending - Off the Clock",
  [SEATOOL_STATUS.SUBMITTED]: "Submitted - Intake Needed",
  [SEATOOL_STATUS.RAI_RESPONSE_WITHDRAW_REQUESTED]: "Formal RAI Response - Withdrawal Requested",
  [SEATOOL_STATUS.WITHDRAW_REQUESTED]: "Submitted - Intake Needed",
};

export const finalDispositionStatuses = [
  SEATOOL_STATUS.APPROVED,
  SEATOOL_STATUS.DISAPPROVED,
  SEATOOL_STATUS.WITHDRAWN,
  SEATOOL_STATUS.TERMINATED,
  SEATOOL_STATUS.UNSUBMITTED,
];

export const getStatus = (seatoolStatus?: string | null) => {
  const stateStatus = statusToDisplayToStateUser[seatoolStatus ?? "Unknown"];
  const cmsStatus = statusToDisplayToCmsUser[seatoolStatus ?? "Unknown"];
  return { stateStatus, cmsStatus };
};
