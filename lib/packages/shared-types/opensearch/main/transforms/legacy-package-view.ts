import {
  LegacyAdminChange,
  LegacyPackageAction,
  legacyPackageViewSchema,
  SEATOOL_STATUS,
} from "../../..";

export const transform = (id: string) => {
  return legacyPackageViewSchema.transform((data, ctx) => {
    const noso = isLegacyNoso(data);
    if (data.submitterName === "-- --" && !noso) return undefined;
    // This is used to handle legacy hard deletes
    const legacySubmissionTimestamp = normalizeDate(data.submissionTimestamp);
    if (data.componentType?.startsWith("waiverextension")) {
      return {
        id,
        submitterEmail: data.submitterEmail,
        submitterName: data.submitterName,
        origin: "OneMAC",
        originalWaiverNumber: data.parentId,
        state: id.slice(0, 2),
        actionType: "Extend",
        authority: data.temporaryExtensionType,
        stateStatus: "Submitted",
        cmsStatus: "Requested",
        seatoolStatus: SEATOOL_STATUS.PENDING,
        statusDate: normalizeDate(data.submissionTimestamp),
        submissionDate: normalizeDate(data.submissionTimestamp),
        changedDate: normalizeDate(data.submissionTimestamp),
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

const  normalizeDate = (epocDate: number | null | undefined) =>
  epocDate !== null && epocDate !== undefined ? new Date(epocDate)?.toISOString() : null;

function isLegacyNoso(record: LegacyPackageAction): boolean {
  return (
    record.adminChanges?.some(
      (adminChange: LegacyAdminChange) =>
        adminChange.changeType === "Package Added" ||
        adminChange.changeReason?.toLowerCase().includes("noso"),
    ) || false
  );
}
