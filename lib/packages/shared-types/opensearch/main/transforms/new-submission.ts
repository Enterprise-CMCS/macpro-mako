import {
  SEATOOL_AUTHORITIES,
  SEATOOL_STATUS,
  authorityStringToSeatoolAuthority,
  getStatus,
  onemacSchema,
} from "shared-types";
import { seaToolFriendlyTimestamp } from "shared-utils";

const getIdByAuthorityName = (authorityName: string) => {
  try {
    const authorityId = Object.keys(SEATOOL_AUTHORITIES).find(
      (key) =>
        SEATOOL_AUTHORITIES[key].toLowerCase() === authorityName.toLowerCase(),
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

type Flavor = "SPA" | "WAIVER" | "MEDICAID" | "CHIP";

const flavorLookup = (val: string | null): null | string => {
  if (!val) return null;

  const lookup: Record<string, Flavor> = {
    ["1915(b)"]: "WAIVER",
    ["1915(c)"]: "WAIVER",
    ["chip spa"]: "CHIP",
    ["medicaid spa"]: "MEDICAID",
  };

  return lookup[val];
};

export const transform = (id: string) => {
  return onemacSchema.transform((data) => {
    if (data.seaActionType === "Extend") {
      // We should have a separate transform for TE new submission, and possibly for each new-submission that's unique (appk)... todo
      // TODO: mako timestamp
      return {
        id,
        attachments: data.attachments,
        appkParentId: data.appkParentId,
        appkParent: data.appkParent,
        appkTitle: data.appkTitle,
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
        authorityId: getIdByAuthorityName(data.authority.toUpperCase()),
        authority: data.authority,
        stateStatus: "Submitted",
        cmsStatus: "Requested",
        proposedDate: data.proposedEffectiveDate,
        seatoolStatus: SEATOOL_STATUS.PENDING,
        statusDate: getDateStringOrNullFromEpoc(data.statusDate),
        submissionDate: getDateStringOrNullFromEpoc(data.submissionDate),
        changedDate: getDateStringOrNullFromEpoc(data.changedDate),
        subject: null,
        description: null,
        makoChangedDate:
          typeof data.timestamp === "number"
            ? new Date(data.timestamp).toISOString()
            : null,
        // ----------
      };
    } else {
      const { stateStatus, cmsStatus } = getStatus(data.seatoolStatus);
      //@ts-ignore
      const currentDate = !!data.timestamp
        ? new Date(data.timestamp).toISOString()
        : seaToolFriendlyTimestamp();
      const result = {
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
        makoChangedDate: currentDate,
        flavor: flavorLookup(data.authority.toLowerCase()),
        proposedDate: data.proposedEffectiveDate,
        actionType: data.seaActionType,
        actionTypeId: 9999,
        authorityId: getIdByAuthorityName(data.authority.toUpperCase()),
        seatoolStatus: SEATOOL_STATUS.PENDING,
        stateStatus,
        cmsStatus,
        statusDate: currentDate,
        submissionDate: seaToolFriendlyTimestamp(),
        changedDate: currentDate,
        subject: null,
        description: null,
        state: data.state,
        authority: authorityStringToSeatoolAuthority[data.authority],
      };
      console.log("SENDING TO OPENSEARCH:");
      console.log(JSON.stringify(result));
      return result;
    }
  });
};

export type Schema = ReturnType<typeof transform>;
