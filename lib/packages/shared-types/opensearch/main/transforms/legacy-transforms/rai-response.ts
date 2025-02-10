import { events, getStatus, SEATOOL_STATUS } from "shared-types";
import { seaToolFriendlyTimestamp } from "../../../../../shared-utils/seatool-date-helper";
import { LegacyEvent } from "../../../../events";


export const transform = () => {
  return events["legacy-event"].legacyEventSchema.transform((data) => {
    const { stateStatus, cmsStatus } = getStatus(SEATOOL_STATUS.SUBMITTED);
    const timestampDate = new Date(data.eventTimestamp);
    const todayEpoch = seaToolFriendlyTimestamp(timestampDate);

      return {
        id: data.pk,
        authority: data.authority,
        ...(data.actionType && { actionType: data.actionType }),
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
