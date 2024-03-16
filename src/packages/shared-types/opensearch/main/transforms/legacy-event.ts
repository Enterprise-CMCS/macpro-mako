import {
  SEATOOL_AUTHORITIES,
  SEATOOL_STATUS,
  onemacLegacySchema,
} from "../../..";

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
  return onemacLegacySchema.transform((data) => {
    // Resolve the action type based on the GSI1pk
    const eventType = data.GSI1pk.split("OneMAC#")[1];
    switch (eventType) {
      case "submitwaivernew":
      case "submitmedicaidspa":
      case "submitchipspa":
      case "submitwaiverappk":
      case "submitwaiveramendment":
      case "submitwaiverrenewal":
        return {
          id: data.componentId,
          submitterEmail: data.submitterEmail,
          submitterName: data.submitterName,
          origin: "OneMAC", // Marks this as having originated from *either* legacy or micro
          devOrigin: "legacy", // Not in use, but helpful for developers browsing OpenSearch
        };
      case "submitwaiverextension":
      case "submitwaiverextensionb":
      case "submitwaiverextensionc":
        if (!data.temporaryExtensionType) return undefined;
        return {
          id: data.componentId,
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
          statusDate: getDateStringOrNullFromEpoc(data.eventTimestamp),
          submissionDate: getDateStringOrNullFromEpoc(data.submissionTimestamp),
          changedDate: getDateStringOrNullFromEpoc(data.eventTimestamp),
          subject: null,
          description: null,
        };
      case "submitmedicaidspawithdraw":
      case "submitrairesponsewithdraw":
      case "submitwaiveramendmentwithdraw":
      case "submitwaivernewwithdraw":
      case "submitchipspawithdraw":
      case "submitwaiverappkwithdraw":
      case "submitwaiverrenewalwithdraw":
        return {
          id: data.componentId,
          raiWithdrawEnabled: false,
        };
      default:
        console.log(
          `Unhandled event type for ${id}:  ${eventType}.  Doing nothing and continuing.`,
        );
        return undefined;
    }
  });
};

export type Schema = ReturnType<typeof transform>;
export const tombstone = (id: string) => {
  return {
    id,
    submitterEmail: null,
    submitterName: null,
    origin: null,
    devOrigin: null,
  };
};
