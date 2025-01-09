import { events, SEATOOL_STATUS } from "shared-types";
import { seaToolFriendlyTimestamp } from "../../../../shared-utils/seatool-date-helper";

export const transform = () => {
  return events["temporary-extension"].schema.transform((data) => {
    const timestampDate = new Date(data.timestamp);
    const todayEpoch = seaToolFriendlyTimestamp(timestampDate);

    return {
      additionalInformation: data.additionalInformation,
      authority: data.authority,
      changedDate: timestampDate?.toISOString(),
      cmsStatus: "Requested",
      description: null,
      id: data.id,
      makoChangedDate: timestampDate?.toISOString(),
      origin: "OneMAC",
      originalWaiverNumber: data.waiverNumber,
      raiWithdrawEnabled: false, // Set to false for new submissions
      seatoolStatus: SEATOOL_STATUS.PENDING,
      state: data.id?.split("-")?.[0],
      stateStatus: "Submitted",
      statusDate: new Date(todayEpoch).toISOString(),
      subject: null,
      submissionDate: timestampDate.toISOString(),
      submitterEmail: data.submitterEmail,
      submitterName: data.submitterName,
      actionType: data.actionType,
      initialIntakeNeeded: false,
    };
  });
};

export type Schema = ReturnType<typeof transform>;
