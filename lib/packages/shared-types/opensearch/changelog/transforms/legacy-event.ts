import { Action, handleLegacyAttachment, legacyEventSchema } from "../../..";

export const transform = (id: string) => {
  return legacyEventSchema.transform((data) => {
    // Resolve the action type based on the GSI1pk
    const eventType = data?.GSI1pk?.split("OneMAC#submit")?.[1] || "";

    let actionType;

    switch (eventType) {
      case "chipspa":
      case "medicaidspa":
      case "waiveramendment":
      case "waiverappk":
      case "waiverextension":
      case "waiverextensionb":
      case "waiverextensionc":
      case "waivernew":
      case "waiverrenewal":
        actionType = "new-submission";
        break;
      case "chipsparai":
      case "medicaidsparai":
      case "waiveramendmentrai":
      case "waiverappkrai":
      case "waiverrai":
        actionType = Action.RESPOND_TO_RAI;
        break;
      case "chipspawithdraw":
      case "medicaidspawithdraw":
      case "waiveramendmentwithdraw":
      case "waiverappkwithdraw":
      case "waivernewwithdraw":
      case "waiverrenewalwithdraw":
        actionType = Action.WITHDRAW_PACKAGE;
        break;
      case "rairesponsewithdraw":
        actionType = Action.LEGACY_WITHDRAW_RAI_REQUEST;
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
