import { SEATOOL_STATUS, getStatus, newSubmissionSchema } from "shared-types";
import {
  getNextBusinessDayTimestamp,
  seaToolFriendlyTimestamp,
} from "shared-utils";

export const transform = (id: string) => {
  return newSubmissionSchema.transform((data) => {
    const { stateStatus, cmsStatus } = getStatus(SEATOOL_STATUS.PENDING);
    const timestampDate = new Date(data.timestamp);
    const todayEpoch = seaToolFriendlyTimestamp(timestampDate);
    const nextBusinessDayEpoch = getNextBusinessDayTimestamp(timestampDate);
    return {
      id,
      attachments: data.attachments,
      appkParentId: data.appkParentId,
      appkTitle: data.appkTitle,
      appkParent: data.appkParent,
      additionalInformation: data.additionalInformation,
      submitterEmail: data.submitterEmail,
      submitterName: data.submitterName === "-- --" ? null : data.submitterName,
      origin: "OneMAC",
      originalWaiverNumber: data.originalWaiverNumber,
      state: id.split("-")[0],
      authority: data.authority,
      seatoolStatus: SEATOOL_STATUS.PENDING,
      cmsStatus,
      stateStatus,
      raiWithdrawEnabled: false, // Set to false for new submissions
      statusDate: new Date(todayEpoch).toISOString(),
      submissionDate: new Date(nextBusinessDayEpoch).toISOString(),
      changedDate: new Date(data.timestamp).toISOString(),
      makoChangedDate: new Date(data.timestamp).toISOString(),
      // These are not collected by our app, but need to be set for our frontend to display things properly
      subject: null,
      description: null,
    };
    // }
  });
};

export type Schema = ReturnType<typeof transform>;
