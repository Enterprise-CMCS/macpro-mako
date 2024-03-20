import {
  legacyPackageViewSchema,
  SEATOOL_AUTHORITIES,
  SEATOOL_STATUS,
} from "../../..";

export const transform = (id: string) => {
  return legacyPackageViewSchema.transform((data) => {
    const noso = isLegacyNoso(data);
    if (data.submitterName === "-- --" && !noso) return undefined;
    // This is used to handle legacy hard deletes
    const legacySubmissionTimestamp = getDateStringOrNullFromEpoc(
      data.submissionTimestamp,
    );
    if (!data.componentType?.startsWith("waiverextension")) {
      return {
        id,
        submitterEmail: data.submitterEmail,
        submitterName:
          data.submitterName === "-- --" ? null : data.submitterName,
        origin: isLegacyNoso(data) ? "SEATool" : "OneMAC",
        legacySubmissionTimestamp,
      };
    }
    return {
      id,
      submitterEmail: data.submitterEmail,
      submitterName: data.submitterName,
      origin: "OneMAC",
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
      legacySubmissionTimestamp,
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

function isLegacyNoso(record: any): boolean {
  return (
    record.adminChanges?.some(
      (adminChange: any) =>
        adminChange.changeType === "Package Added" ||
        adminChange.changeReason?.toLowerCase().includes("noso"),
    ) || false
  );
}
