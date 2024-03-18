import {
  legacyPackageViewSchema,
  SEATOOL_AUTHORITIES,
  SEATOOL_STATUS,
} from "../../..";

export const transform = (id: string) => {
  return legacyPackageViewSchema.transform((data) => {
    if (!data.componentType?.startsWith("waiverextension")) {
      return {
        id,
        submitterEmail: data.submitterEmail,
        submitterName:
          data.submitterName === "-- --" ? null : data.submitterName,
        origin: "OneMAC",
      };
    }
    return {
      id,
      submitterEmail: data.submitterEmail,
      submitterName: data.submitterName,
      origin: "OneMAC", // Marks this as having originated from *either* legacy or micro
      devOrigin: "legacy", // Not in use, but helpful for developers browsing OpenSearch
      originalWaiverNumber: data.parentId,
      flavor: "WAIVER",
      state: id.slice(0, 2),
      actionType: "Extend",
      actionTypeId: 9999,
      authorityId: data.temporaryExtensionType
        ? getIdByAuthorityName(data.temporaryExtensionType)
        : null,
      authority: data.temporaryExtensionType,
      stateStatus: "Submitted",
      cmsStatus: "Requested",
      seatoolStatus: SEATOOL_STATUS.PENDING,
      statusDate: getDateStringOrNullFromEpoc(data.submissionTimestamp),
      submissionDate: getDateStringOrNullFromEpoc(data.submissionTimestamp),
      changedDate: getDateStringOrNullFromEpoc(data.submissionTimestamp),
      subject: null,
      description: null,
    };
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
