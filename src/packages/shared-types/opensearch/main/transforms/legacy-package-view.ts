import { getAuthorityDetailsFromRecord } from "shared-utils";
import {
  LegacyAdminChange,
  LegacyPackageAction,
  legacyPackageViewSchema,
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
    if (data.componentType?.startsWith("waiverextension")) {
      const { authorityId, authority } = getAuthorityDetailsFromRecord(data);
      return {
        id,
        submitterEmail: data.submitterEmail,
        submitterName: data.submitterName,
        origin: "OneMAC",
        originalWaiverNumber: data.parentId,
        flavor: "WAIVER",
        state: id.slice(0, 2),
        actionType: "Extend",
        actionTypeId: 9999,
        authorityId,
        authority,
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
    }
    return {
      id,
      submitterEmail: data.submitterEmail,
      submitterName: data.submitterName === "-- --" ? null : data.submitterName,
      origin: isLegacyNoso(data) ? "SEATool" : "OneMAC",
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

const getDateStringOrNullFromEpoc = (epocDate: number | null | undefined) =>
  epocDate !== null && epocDate !== undefined
    ? new Date(epocDate).toISOString()
    : null;

function isLegacyNoso(record: LegacyPackageAction): boolean {
  return (
    record.adminChanges?.some(
      (adminChange: LegacyAdminChange) =>
        adminChange.changeType === "Package Added" ||
        adminChange.changeReason?.toLowerCase().includes("noso"),
    ) || false
  );
}
