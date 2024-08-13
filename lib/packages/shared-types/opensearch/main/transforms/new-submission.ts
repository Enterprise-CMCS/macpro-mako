import { SEATOOL_STATUS, getStatus, newSubmissionSchema } from "shared-types";
import {
  getNextBusinessDayTimestamp,
  seaToolFriendlyTimestamp,
} from "../../../../shared-utils/seatool-date-helper";

export const transform = (id: string) => {
  return newSubmissionSchema.transform((data) => {
    const { stateStatus, cmsStatus } = getStatus(SEATOOL_STATUS.PENDING);
    const timestampDate = new Date(data.timestamp);
    const todayEpoch = seaToolFriendlyTimestamp(timestampDate);
    const nextBusinessDayEpoch = getNextBusinessDayTimestamp(timestampDate);
    return {
      additionalInformation: data.additionalInformation,
      appkParent: data.appkParent,
      appkParentId: data.appkParentId,
      appkTitle: data.appkTitle,
      attachments: data.attachments,
      authority: data.authority,
      changedDate: new Date(data.timestamp).toISOString(),
      cmsStatus,
      description: null,
      id,
      makoChangedDate: new Date(data.timestamp).toISOString(),
      origin: "OneMAC",
      originalWaiverNumber: data.originalWaiverNumber,
      raiWithdrawEnabled: false, // Set to false for new submissions
      seatoolStatus: SEATOOL_STATUS.PENDING,
      state: id.split("-")[0],
      stateStatus,
      statusDate: new Date(todayEpoch).toISOString(),
      subject: null,
      submissionDate: new Date(nextBusinessDayEpoch).toISOString(),
      submitterEmail: data.submitterEmail,
      submitterName: data.submitterName,
    };
    // }
  });
};

export type Schema = ReturnType<typeof transform>;
