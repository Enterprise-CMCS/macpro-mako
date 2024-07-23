import { SEATOOL_STATUS, onemacSchema } from "shared-types";
import { getAuthorityDetailsFromRecord } from "shared-utils";

const getDateStringOrNullFromEpoc = (epocDate: number | null | undefined) =>
  epocDate !== null && epocDate !== undefined
    ? new Date(epocDate).toISOString()
    : null;

export const transform = (id: string) => {
  return onemacSchema.transform((data) => {
    if (data.seaActionType === "Extend") {
      // We should have a separate transform for TE new submission, and possibly for each new-submission that's unique (appk)... todo
      // TODO: mako timestamp

      const { authorityId, authority } = getAuthorityDetailsFromRecord(data);
      return {
        id,
        attachments: data.attachments,
        appkParentId: data.appkParentId,
        raiWithdrawEnabled: data.raiWithdrawEnabled,
        additionalInformation: data.additionalInformation,
        submitterEmail: data.submitterEmail,
        submitterName:
          data.submitterName === "-- --" ? null : data.submitterName,
        origin: "OneMAC",
        originalWaiverNumber: data.originalWaiverNumber,
        // ----------
        // The fields below are usually set by way of seatool and the ksql output, but must be set here for TEs.
        flavor: "WAIVER",
        state: id.split("-")[0],
        actionType: data.seaActionType,
        actionTypeId: 9999,
        authorityId,
        authority,
        stateStatus: "Submitted",
        cmsStatus: "Requested",
        seatoolStatus: SEATOOL_STATUS.PENDING,
        statusDate: getDateStringOrNullFromEpoc(data.statusDate),
        submissionDate: getDateStringOrNullFromEpoc(data.submissionDate),
        changedDate: getDateStringOrNullFromEpoc(data.changedDate),
        subject: null,
        description: null,
        makoChangedDate: data.timestamp
          ? new Date(data.timestamp).toISOString()
          : null,
        // ----------
      };
    } else {
      return {
        id,
        attachments: data.attachments,
        appkParentId: data.appkParentId,
        appkTitle: data.appkTitle, // this probably maps to subject, but for now we're just going to put it in main directly
        appkParent: data.appkParent,
        raiWithdrawEnabled: data.raiWithdrawEnabled,
        additionalInformation: data.additionalInformation,
        submitterEmail: data.submitterEmail,
        submitterName:
          data.submitterName === "-- --" ? null : data.submitterName,
        origin: "OneMAC",
        makoChangedDate: data.timestamp
          ? new Date(data.timestamp).toISOString()
          : null,
      };
    }
  });
};

export type Schema = ReturnType<typeof transform>;
