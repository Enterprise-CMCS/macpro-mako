import { legacyEventSchema, handleLegacyAttachment, Action } from "../../..";

export const transform = (id: string) => {
  return legacyEventSchema.transform((data) => {
    // Resolve the action type based on the GSI1pk
    const eventType = data.GSI1pk.split("OneMAC#")[1];

    let actionType;

    switch (eventType) {
      case "enableRAIResponseWithdraw":
        actionType = Action.ENABLE_RAI_WITHDRAW;
        break;
      case "submitchipspa":
      case "submitmedicaidspa":
      case "submitwaiveramendment":
      case "submitwaiverappk":
      case "submitwaiverextension":
      case "submitwaiverextensionb":
      case "submitwaiverextensionc":
      case "submitwaivernew":
      case "submitwaiverrenewal":
        actionType = "new-submission";
        break;
      case "submitchipsparai":
      case "submitmedicaidsparai":
      case "submitwaiveramendmentrai":
      case "submitwaiverappkrai":
      case "submitwaiverrai":
        actionType = Action.RESPOND_TO_RAI;
        break;
      case "submitchipspawithdraw":
      case "submitmedicaidspawithdraw":
      case "submitwaiveramendmentwithdraw":
      case "submitwaiverappkwithdraw":
      case "submitwaivernewwithdraw":
      case "submitwaiverrenewalwithdraw":
        actionType = Action.WITHDRAW_PACKAGE;
        break;
      case "submitrairesponsewithdraw":
        actionType = Action.WITHDRAW_RAI; // This should be a separate action thats just a request
        break;
      default:
        console.log(
          `Unhandled event type for ${id}:  ${eventType}.  Doing nothing and continuing.`,
        );
        actionType = undefined;
        break;
    }

    // Return if the actionType is unhandled
    if (actionType === undefined) return undefined;

    // If we're still here, go ahead and transform the data
    const transformedData = {
      // Append only changelog, so we add the offset to make the document id unique
      // Legacy emits can emit multiple events for the same business event, so we key off the timestamp, not the offset, to prevent duplciates
      id: `${data.componentId}-legacy-${data.eventTimestamp}`,
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
