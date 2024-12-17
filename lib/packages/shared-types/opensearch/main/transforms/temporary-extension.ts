import { events, SEATOOL_STATUS } from "shared-types";
import {
  getNextBusinessDayTimestamp,
  seaToolFriendlyTimestamp,
} from "../../../../shared-utils/seatool-date-helper";

export const transform = () => {
  // any adhoc logic
  return events["temporary-extension"].schema.transform((data) => {
    const timestampDate = data.timestamp ? new Date(data.timestamp) : undefined;
    const todayEpoch = seaToolFriendlyTimestamp(timestampDate);
    const nextBusinessDayEpoch = getNextBusinessDayTimestamp(timestampDate);

    return {
      additionalInformation: data.additionalInformation,
      authority: data.authority,
      changedDate: timestampDate?.toISOString() || null,
      cmsStatus: "Requested",
      description: null,
      id: data.id,
      makoChangedDate: timestampDate?.toISOString() || null,
      origin: "OneMAC",
      originalWaiverNumber: data.waiverNumber,
      raiWithdrawEnabled: false, // Set to false for new submissions
      seatoolStatus: SEATOOL_STATUS.PENDING,
      state: data.id?.split("-")?.[0],
      stateStatus: "Submitted",
      statusDate: new Date(todayEpoch).toISOString() || null,
      subject: null,
      submissionDate: new Date(nextBusinessDayEpoch).toISOString() || null,
      submitterEmail: data.submitterEmail,
      submitterName: data.submitterName,
      actionType: data.actionType,
      initialIntakeNeeded: false,
    };
  });
};

export type Schema = ReturnType<typeof transform>;
