import {
  SEATOOL_AUTHORITIES,
  SEATOOL_STATUS,
  getStatus,
  onemacSchema,
} from "shared-types";

const getIdByAuthorityName = (authorityName: string) => {
  try {
    const authorityId = Object.keys(SEATOOL_AUTHORITIES).find(
      (key) => SEATOOL_AUTHORITIES[key] === authorityName
    );
    return authorityId ? parseInt(authorityId, 10) : null;
  } catch (error) {
    console.error(`SEATOOL AUTHORITY ID LOOKUP ERROR: ${authorityName}`);
    console.error(error);
    return null;
  }
};

export const transform = (id: string) => {
  return onemacSchema.transform((data) => {
    if (data.seaActionType === "Extend") {
      // We should have a separate transform for TE new submission... todo
      const seatoolStatus = SEATOOL_STATUS.PENDING;
      const { stateStatus, cmsStatus } = getStatus(seatoolStatus);
      const transformedData = {
        id,
        flavor: "WAIVER",
        actionType: data.seaActionType,
        // actionTypeId: 999999, // There isnt an action type id.. do we want this set or not set at all?
        approvedEffectiveDate: null,
        description: null, // This will be avilable when 4 fields come in.
        finalDispositionDate: null,
        leadAnalystOfficerId: null,
        initialIntakeNeeded: null,
        leadAnalystName: null,
        authorityId: getIdByAuthorityName(data.authority),
        authority: data.authority,
        // types and subtypes will very soon be collected by the frontend and be avialable to be set.  these are null for now.
        typeId: null,
        typeName: null,
        subTypeId: null,
        subTypeName: null,
        proposedDate: null,
        raiReceivedDate: null,
        raiRequestedDate: null,
        raiWithdrawnDate: null,
        reviewTeam: null,
        state: id.split("-")[0],
        stateStatus,
        cmsStatus,
        seatoolStatus,
        subject: null,
        secondClock: null,
        raiWithdrawEnabled: null,

        attachments: data.attachments,
        additionalInformation: data.additionalInformation,
        submitterEmail: data.submitterEmail,
        submitterName:
          data.submitterName === "-- --" ? null : data.submitterName,
        origin: "OneMAC",
        statusDate: data.statusDate,
        submissionDate: data.submissionDate,
        changedDate: data.changedDate,
      };
      return transformedData;
    }

    const transformedData = {
      id,
      attachments: data.attachments,
      appkParentId: data.appkParentId,
      raiWithdrawEnabled: data.raiWithdrawEnabled,
      additionalInformation: data.additionalInformation,
      submitterEmail: data.submitterEmail,
      submitterName: data.submitterName === "-- --" ? null : data.submitterName,
      origin: "OneMAC",
    };
    return transformedData;
  });
};

export type Schema = ReturnType<typeof transform>;
