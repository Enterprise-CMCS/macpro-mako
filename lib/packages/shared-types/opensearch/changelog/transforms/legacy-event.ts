import { Action, handleLegacyAttachment, legacyEventSchema } from "../../..";
import { ONEMAC_LEGACY_ORIGIN } from "../../main/transforms/legacy-transforms";

export const transform = (id: string) => {
  return legacyEventSchema.transform((data) => {
    // Resolve the action type based on the GSI1pk
    const eventType = data?.GSI1pk?.split("OneMAC#submit")?.[1] || "";

    let event;

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
        event = "new-legacy-submission";
        break;
      case "chipsparai":
      case "medicaidsparai":
      case "waiveramendmentrai":
      case "waiverappkrai":
      case "waiverrai":
        event = Action.RESPOND_TO_RAI;
        break;
      case "chipspawithdraw":
      case "medicaidspawithdraw":
      case "waiveramendmentwithdraw":
      case "waiverappkwithdraw":
      case "waivernewwithdraw":
      case "waiverrenewalwithdraw":
        event = Action.WITHDRAW_PACKAGE;
        break;
      case "rairesponsewithdraw":
        event = Action.LEGACY_WITHDRAW_RAI_REQUEST;
        break;
      case "medicaidspasubsequent":
      case "chipspasubsequent":
      case "waiverappksubsequent":
      case "waivernewsubsequent":
      case "waiverrenewalsubsequent":
      case "waiveramendmentsubsequent":
        event = Action.UPLOAD_SUBSEQUENT_DOCUMENTS;
        break;
      default:
        console.log(
          `Unhandled event type for ${id}:  ${eventType}.  Doing nothing and continuing.`,
        );
        event = undefined;
        break;
    }

    // Return if the actionType is unhandled
    if (event === undefined) return undefined;

    // If we're still here, go ahead and transform the data
    const transformedData = {
      // Append only changelog, so we add the offset to make the document id unique
      // Legacy emits can emit multiple events for the same business event, so we key off the timestamp, not the offset, to prevent duplciates
      id: `${data.componentId}-legacy-${data.eventTimestamp}`,
      packageId: data.componentId,
      timestamp: data.eventTimestamp,
      event: event,
      attachments: data.attachments?.map(handleLegacyAttachment) ?? null,
      additionalInformation: data.additionalInformation,
      submitterEmail: data.submitterEmail,
      submitterName: data.submitterName,
      origin: ONEMAC_LEGACY_ORIGIN,
    };
    return transformedData;
  });
};

export type Schema = ReturnType<typeof transform>;
