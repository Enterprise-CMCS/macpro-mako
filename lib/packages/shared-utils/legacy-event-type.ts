import { Action } from "shared-types";

// Resolve the action type based on the GSI1pk
export const getLegacyEventType = (GSI1pk: string) => {
  if (!GSI1pk) {
    return undefined;
  }
  const submitType = GSI1pk?.split("OneMAC#submit")?.[1] || "";

  let event;

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
      console.log(`Unhandled event type for ${submitType}.  Doing nothing and continuing.`);
      event = undefined;
      break;
  }
  return event;
};
