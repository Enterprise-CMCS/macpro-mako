import {
  SEATOOL_AUTHORITIES,
  SEATOOL_STATUS,
  onemacSchema,
} from "shared-types";

const getIdByAuthorityName = (authorityName: string) => {
  try {
    const authorityId = Object.keys(SEATOOL_AUTHORITIES).find(
      (key) => SEATOOL_AUTHORITIES[key] === authorityName,
    );
    return authorityId ? parseInt(authorityId, 10) : null;
  } catch (error) {
    console.error(`SEATOOL AUTHORITY ID LOOKUP ERROR: ${authorityName}`);
    console.error(error);
    return null;
  }
};

const getDateStringOrNullFromEpoc = (epocDate: number | null | undefined) =>
  epocDate !== null && epocDate !== undefined
    ? new Date(epocDate).toISOString()
    : null;

export const transform = (id: string) => {
  return onemacSchema.transform((data) => {
    if (data.seaActionType === "Extend") {
      // We should have a separate transform for TE new submission, and possibly for each new-submission that's unique (appk)... todo
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
        devOrigin: "micro",
        originalWaiverNumber: data.originalWaiverNumber,
        // ----------
        // The fields below are usually set by way of seatool and the ksql output, but must be set here for TEs.
        flavor: "WAIVER",
        state: id.split("-")[0],
        actionType: data.seaActionType,
        actionTypeId: 9999,
        authorityId: getIdByAuthorityName(data.authority),
        authority: data.authority,
        stateStatus: "Submitted",
        cmsStatus: "Requested",
        seatoolStatus: SEATOOL_STATUS.PENDING,
        statusDate: getDateStringOrNullFromEpoc(data.statusDate),
        submissionDate: getDateStringOrNullFromEpoc(data.submissionDate),
        changedDate: getDateStringOrNullFromEpoc(data.changedDate),
        subject: null,
        description: null,
        // ----------
      };
    } else {
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
        devOrigin: "micro",
      };
    }
  });
};

export type Schema = ReturnType<typeof transform>;
