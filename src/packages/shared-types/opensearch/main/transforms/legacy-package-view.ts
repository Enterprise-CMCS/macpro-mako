import { legacyPackageViewSchema, handleLegacyAttachment } from "../../..";

export const transform = (id: string) => {
  return legacyPackageViewSchema.transform((data) => {
    const transformedData = {
      id,
      attachments: data.attachments?.map(handleLegacyAttachment) ?? null,
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
export const tombstone = (id: string) => {
  return {
    id,
    additionalInformation: null,
    raiWithdrawEnabled: null,
    attachments: null,
    submitterEmail: null,
    submitterName: null,
    origin: null,
  };
};

// if (!data.temporaryExtensionType) return undefined;
// return {
//   id: data.componentId,
//   submitterEmail: data.submitterEmail,
//   submitterName: data.submitterName,
//   origin: "OneMAC", // Marks this as having originated from *either* legacy or micro
//   devOrigin: "legacy", // Not in use, but helpful for developers browsing OpenSearch
//   originalWaiverNumber: data.parentId,
//   flavor: "WAIVER",
//   state: id.slice(0, 2),
//   actionType: "Extend",
//   actionTypeId: 9999,
//   authorityId: data.temporaryExtensionType
//     ? getIdByAuthorityName(data.temporaryExtensionType)
//     : null,
//   authority: data.temporaryExtensionType,
//   stateStatus: "Submitted",
//   cmsStatus: "Requested",
//   seatoolStatus: SEATOOL_STATUS.PENDING,
//   statusDate: getDateStringOrNullFromEpoc(data.eventTimestamp),
//   submissionDate: getDateStringOrNullFromEpoc(data.submissionTimestamp),
//   changedDate: getDateStringOrNullFromEpoc(data.eventTimestamp),
//   subject: null,
//   description: null,
// };
