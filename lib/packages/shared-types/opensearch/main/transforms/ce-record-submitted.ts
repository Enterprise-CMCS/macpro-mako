import { seaToolFriendlyTimestamp } from "shared-utils/seatool-date-helper";

import { events, getStatus, SEATOOL_STATUS } from "../../../index";

export const transform = () => {
  return events["ce-record-submitted"].schema.transform((data) => {
    const { stateStatus, cmsStatus } = getStatus(SEATOOL_STATUS.SUBMITTED);
    const timestampDate = new Date(data.timestamp);
    const todayEpoch = seaToolFriendlyTimestamp(timestampDate);

    return {
      additionalInformation: data.additionalInformation,
      authority: data.authority,
      changedDate: timestampDate.toISOString(),
      cmsStatus,
      description: null,
      hardshipKind: data.hardshipKind,
      id: data.id,
      makoChangedDate: timestampDate.toISOString(),
      origin: "OneMAC",
      raiWithdrawEnabled: false,
      seatoolStatus: SEATOOL_STATUS.SUBMITTED,
      state: data.state,
      stateStatus,
      statusDate: new Date(todayEpoch).toISOString(),
      proposedDate: data.proposedEffectiveDate,
      subject: null,
      submissionDate: timestampDate.toISOString(),
      submitterEmail: data.submitterEmail,
      submitterName: data.submitterName,
      initialIntakeNeeded: true,
    };
  });
};

export type Schema = ReturnType<typeof transform>;
