import { events, getStatus, SEATOOL_STATUS } from "shared-types";

export const transform = () => {
  return events["withdraw-package"].schema.transform((data) => {
    const { stateStatus, cmsStatus } = getStatus(SEATOOL_STATUS.WITHDRAWN);
    return {
      id: data.id,
      raiWithdrawEnabled: false,
      makoChangedDate: data.timestamp ? new Date(data.timestamp).toISOString() : null,
      cmsStatus,
      stateStatus,
      finalDispositionDate: new Date(data.timestamp).toISOString(),
      seatoolStatus: SEATOOL_STATUS.WITHDRAWN,
      initialIntakeNeeded: false,
      locked: true,
    };
  });
};

export type Schema = ReturnType<typeof transform>;
