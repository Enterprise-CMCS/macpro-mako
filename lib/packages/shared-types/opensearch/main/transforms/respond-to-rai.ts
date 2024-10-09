import { events, getStatus, SEATOOL_STATUS } from "shared-types";
export const transform = () => {
  return events["respond-to-rai"].schema.transform((data) => {
    const { stateStatus, cmsStatus } = getStatus(SEATOOL_STATUS.PENDING_RAI);
    return {
      id: data.id,
      raiWithdrawEnabled: false,
      makoChangedDate: data.timestamp
        ? new Date(data.timestamp).toISOString()
        : null,
      cmsStatus,
      stateStatus,
      seatoolStatus: SEATOOL_STATUS.PENDING_RAI,
      locked: true,
    };
  });
};
export type Schema = ReturnType<typeof transform>;

