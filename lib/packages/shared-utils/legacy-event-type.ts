import { Action } from "shared-types";

// Resolve the action type based on the GSI1pk
export const getLegacyEventType = (gsi1pk: string) => {
  if (gsi1pk === "") {
    return undefined;
  }
  const submitType = gsi1pk.split("OneMAC#submit")?.[1] || "";

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
      return "new-legacy-submission";
    case "chipsparai":
    case "medicaidsparai":
    case "waiveramendmentrai":
    case "waiverappkrai":
    case "waiverrai":
      return Action.RESPOND_TO_RAI;
    case "chipspawithdraw":
    case "medicaidspawithdraw":
    case "waiveramendmentwithdraw":
    case "waiverappkwithdraw":
    case "waivernewwithdraw":
    case "waiverrenewalwithdraw":
      return Action.WITHDRAW_PACKAGE;
    case "rairesponsewithdraw":
      return Action.LEGACY_WITHDRAW_RAI_REQUEST;
    case "medicaidspasubsequent":
    case "chipspasubsequent":
    case "waiverappksubsequent":
    case "waivernewsubsequent":
    case "waiverrenewalsubsequent":
    case "waiveramendmentsubsequent":
      return Action.UPLOAD_SUBSEQUENT_DOCUMENTS;
    default:
      console.log(`Unhandled event type for ${submitType}.  Doing nothing and continuing.`);
      return undefined;
  }
};
