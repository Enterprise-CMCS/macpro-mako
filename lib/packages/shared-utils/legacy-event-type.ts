import { Action } from "shared-types";

export const getLegacyEventType = (GSI1pk: string) => {
  // Resolve the action type based on the GSI1pk
  const eventTypeMatch = GSI1pk?.match(/OneMAC#(submit|spa|waiver)(.*)/i);

  if (!eventTypeMatch || !GSI1pk) {
    console.log(`${GSI1pk} is missing or does not match any existing event types.`);
    return undefined;
  }

  const eventType = eventTypeMatch[1].toLowerCase();

  let submitType: string = "";
  let event;

  if (eventType === "spa" || eventType === "waiver") {
    event = "new-legacy-submission";
  }

  if (eventType === "submit") {
    submitType = eventTypeMatch?.[2] || "";

    switch (submitType) {
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
        console.log(`Unhandled event type for ${eventType}.  Doing nothing and continuing.`);
        event = undefined;
        break;
    }
  }
  return event;
};
