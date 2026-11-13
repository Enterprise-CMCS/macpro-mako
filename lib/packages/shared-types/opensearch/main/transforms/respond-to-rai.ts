import { events, getStatus, SEATOOL_STATUS } from "../../../index";

export const transform = () => {
  return events["respond-to-rai"].schema.transform((data) => {
    const { stateStatus, cmsStatus } = getStatus(SEATOOL_STATUS.SUBMITTED);
    // A new CHIP response replaces the previous response-withdrawal cycle.
    // Keep the projection type compatible with dates stored by other events.
    const withdrawalReset: { raiWithdrawnDate?: string | null } =
      data.authority === "CHIP SPA" ? { raiWithdrawnDate: null } : {};
    return {
      id: data.id,
      authority: data.authority,
      ...(data.actionType && { actionType: data.actionType }),
      raiWithdrawEnabled: false,
      makoChangedDate: data.timestamp ? new Date(data.timestamp).toISOString() : null,
      cmsStatus,
      stateStatus,
      raiReceivedDate: data.timestamp ? new Date(data.timestamp).toISOString() : null,
      ...withdrawalReset,
      seatoolStatus: SEATOOL_STATUS.SUBMITTED,
      initialIntakeNeeded: true,
      locked: true,
    };
  });
};
export type Schema = ReturnType<typeof transform>;
