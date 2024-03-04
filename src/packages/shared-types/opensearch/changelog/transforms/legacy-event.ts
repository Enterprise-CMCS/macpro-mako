import { onemacLegacySchema, handleLegacyAttachment, Action } from "../../..";

export const transform = (id: string, offset: number) => {
  return onemacLegacySchema.transform((data) => {
    // Resolve the action type based on the GSI1pk
    const eventType = data.GSI1pk.split("OneMAC#submit")[1];
    const actionType = (() => {
      switch (eventType) {
        case "waivernew":
        case "medicaidspa":
        case "chipspa":
        case "waiverappk":
        case "waiveramendment":
        case "waiverrenewal":
          return "new-submission";
        case "medicaidsparai":
        case "chipsparai":
        case "waiverrai":
        case "waiverappkrai":
          return Action.RESPOND_TO_RAI;
        case "rairesponsewithdraw":
          return Action.WITHDRAW_RAI;
        case "medicaidspawithdraw":
        case "waiveramendmentwithdraw":
        case "chipspawithdraw":
        case "waiverappkwithdraw":
        case "waivernewwithdraw":
          return Action.WITHDRAW_PACKAGE;
        case "waiverextension": // Will be handled in near future
        case "waiverextensionb": // Will be handled in near future
        case "waiverextensionc": // Will be handled in near future
        default:
          console.log(
            `Unhandled event type for ${id}:  ${eventType}.  Doing nothing and continuing.`
          );
          return undefined;
      }
    })();

    // Return if the actionType is unhandled
    if (actionType === undefined) return undefined;

    // If we're still here, go ahead and transform the data
    const transformedData = {
      id: `${id}-${offset}`, // Append only changelog, so we add the offset to make the document id unique
      packageId: id,
      timestamp: data.eventTimestamp,
      actionType,
      attachments: data.attachments?.map(handleLegacyAttachment) ?? null,
      additionalInformation: data.additionalInformation,
      submitterEmail: data.submitterEmail,
      submitterName: data.submitterName,
    };
    return transformedData;
  });
};

export type Schema = ReturnType<typeof transform>;
