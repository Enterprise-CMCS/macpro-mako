import { events, getStatus, SEATOOL_STATUS } from "shared-types";
import { seaToolFriendlyTimestamp } from "../../../../shared-utils/seatool-date-helper";

export const transform = () => {
  return events["capitated-renewal"].schema.transform((data) => {
    const { stateStatus, cmsStatus } = getStatus(SEATOOL_STATUS.PENDING);
    const timestampDate = new Date(data.timestamp);
    const todayEpoch = seaToolFriendlyTimestamp(timestampDate);

    return {
      additionalInformation: data.additionalInformation,
      authority: data.authority,
      changedDate: timestampDate.toISOString(),
      cmsStatus,
      description: null,
      id: data.id,
      makoChangedDate: timestampDate.toISOString(),
      origin: "OneMAC",
      raiWithdrawEnabled: false, // Set to false for new submissions
      seatoolStatus: SEATOOL_STATUS.PENDING,
      state: data.id?.split("-")?.[0],
      stateStatus,
      statusDate: new Date(todayEpoch).toISOString(),
      proposedDate: data.proposedEffectiveDate, // wish this was proposedEffectiveDate
      subject: null,
      submissionDate: timestampDate.toISOString(),
      submitterEmail: data.submitterEmail,
      submitterName: data.submitterName,
      actionType: data.actionType,
      initialIntakeNeeded: true,
    };
  });
};

export type Schema = ReturnType<typeof transform>;
