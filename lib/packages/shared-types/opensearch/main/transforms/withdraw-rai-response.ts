import { events, getStatus, SEATOOL_STATUS } from "../../../index";

export const transform = () => {
  return events["withdraw-rai"].schema.transform((data) => {
    const { stateStatus, cmsStatus } = getStatus(SEATOOL_STATUS.RAI_RESPONSE_WITHDRAW_REQUESTED);
    return {
      id: data.id,
      raiWithdrawEnabled: false,
      makoChangedDate: data.timestamp ? new Date(data.timestamp).toISOString() : null,
      raiReceivedDate: null,
      cmsStatus,
      stateStatus,
      seatoolStatus: SEATOOL_STATUS.RAI_RESPONSE_WITHDRAW_REQUESTED,
      secondClock: false,
      locked: true,
      chipEligibility: data.chipEligibility,
    };
  });
};

export type Schema = ReturnType<typeof transform>;
