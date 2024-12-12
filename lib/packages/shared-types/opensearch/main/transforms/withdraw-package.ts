import { events, getStatus, SEATOOL_STATUS } from "shared-types";

export const transform = () => {
  return events["withdraw-package"].schema.transform((data) => {
    const { stateStatus, cmsStatus } = getStatus(SEATOOL_STATUS.WITHDRAW_REQUESTED);
    return {
      id: data.id,
      raiWithdrawEnabled: false,
      makoChangedDate: data.timestamp ? new Date(data.timestamp).toISOString() : null,
      cmsStatus,
      stateStatus,
      finalDispositionDate: data.timestamp ? new Date(data.timestamp).toISOString() : null,
      seatoolStatus: SEATOOL_STATUS.WITHDRAW_REQUESTED,
      initialIntakeNeeded: true,
      locked: true,
    };
  });
};

export type Schema = ReturnType<typeof transform>;
