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
  UNKNOWN: "unknown",
};

export const statusToDisplayToStateUser = {
  [SEATOOL_STATUS.PENDING]: "Under Review",
  [SEATOOL_STATUS.PENDING_RAI]: "RAI Issued",
  [SEATOOL_STATUS.APPROVED]: "Approved",
  [SEATOOL_STATUS.DISAPPROVED]: "Disapproved",
  [SEATOOL_STATUS.WITHDRAWN]: "Package Withdrawn",
  [SEATOOL_STATUS.TERMINATED]: "Waiver Terminated",
  [SEATOOL_STATUS.PENDING_CONCURRENCE]: "Under Review",
  [SEATOOL_STATUS.UNSUBMITTED]: "Unsubmitted",
  [SEATOOL_STATUS.PENDING_APPROVAL]: "Under Review",
};

export const statusToDisplayToCmsUser = {
  [SEATOOL_STATUS.PENDING]: "Pending",
  [SEATOOL_STATUS.PENDING_RAI]: "Pending RAI",
  [SEATOOL_STATUS.APPROVED]: "Approved",
  [SEATOOL_STATUS.DISAPPROVED]: "Disapproved",
  [SEATOOL_STATUS.WITHDRAWN]: "Package Withdrawn",
  [SEATOOL_STATUS.TERMINATED]: "Waiver Terminated",
  [SEATOOL_STATUS.PENDING_CONCURRENCE]: "Under Review",
  [SEATOOL_STATUS.UNSUBMITTED]: "Unsubmitted",
  [SEATOOL_STATUS.PENDING_APPROVAL]: "Under Review",
};

export const getStatus = (status: string, isCms?: boolean) => {
  return isCms
    ? statusToDisplayToCmsUser[status]
    : statusToDisplayToStateUser[status];
};
