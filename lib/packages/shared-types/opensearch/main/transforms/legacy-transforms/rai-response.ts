import { events, getStatus, SEATOOL_STATUS } from "../../../../index";

export const transform = () => {
  return events["legacy-event"].legacyEventSchema.transform((data) => {
    const { stateStatus, cmsStatus } = getStatus(SEATOOL_STATUS.SUBMITTED);

    return {
      id: data.pk,
      raiWithdrawEnabled: false,
      makoChangedDate: data.eventTimestamp ? new Date(data.eventTimestamp).toISOString() : null,
      cmsStatus,
      stateStatus,
      raiReceivedDate: data.eventTimestamp ? new Date(data.eventTimestamp).toISOString() : null,
      seatoolStatus: SEATOOL_STATUS.SUBMITTED,
      initialIntakeNeeded: true,
      locked: true,
    };
  });
};

export type Schema = ReturnType<typeof transform>;
