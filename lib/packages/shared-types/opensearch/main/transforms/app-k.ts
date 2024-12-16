import { events, getStatus, SEATOOL_STATUS } from "shared-types";
import {
  getNextBusinessDayTimestamp,
  seaToolFriendlyTimestamp,
} from "../../../../shared-utils/seatool-date-helper";

export const transform = () => {
  return events["app-k"].schema.transform((data) => {
    const { stateStatus, cmsStatus } = getStatus(SEATOOL_STATUS.SUBMITTED);
    const timestampDate = data.timestamp ? new Date(data.timestamp) : undefined;
    const todayEpoch = seaToolFriendlyTimestamp(timestampDate);
    const nextBusinessDayEpoch = getNextBusinessDayTimestamp(timestampDate);

    return {
      title: data.title,
      additionalInformation: data.additionalInformation,
      authority: data.authority,
      changedDate: timestampDate?.toISOString() || null,
      cmsStatus,
      description: null,
      id: data.id,
      makoChangedDate: timestampDate?.toISOString() || null,
      origin: "OneMAC",
      raiWithdrawEnabled: false, // Set to false for new submissions
      seatoolStatus: SEATOOL_STATUS.SUBMITTED,
      state: data.id?.split("-")?.[0],
      stateStatus,
      statusDate: new Date(todayEpoch).toISOString() || null,
      proposedDate: data.proposedEffectiveDate,
      subject: null,
      submissionDate: new Date(nextBusinessDayEpoch).toISOString() || null,
      submitterEmail: data.submitterEmail,
      submitterName: data.submitterName,
      actionType: data.actionType,
      initialIntakeNeeded: true,
    };
  });
};

export type Schema = ReturnType<typeof transform>;
