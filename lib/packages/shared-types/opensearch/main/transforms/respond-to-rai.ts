import { events, getStatus, SEATOOL_STATUS } from "shared-types";
export const transform = () => {
  return events["respond-to-rai"].schema.transform((data) => {
    const { stateStatus, cmsStatus } = getStatus(SEATOOL_STATUS.SUBMITTED);
    return {
      id: data.id,
      authority: data.authority,
      ...(data.actionType && { actionType: data.actionType }),
      raiWithdrawEnabled: false,
      makoChangedDate: data.timestamp ? new Date(data.timestamp).toISOString() : null,
      cmsStatus,
      stateStatus,
      raiReceivedDate: data.timestamp ? new Date(data.timestamp).toISOString() : null,
      seatoolStatus: SEATOOL_STATUS.SUBMITTED,
      initialIntakeNeeded: true,
      locked: true,
    };
  });
};
export type Schema = ReturnType<typeof transform>;
