import { Action } from "shared-types";

// Resolve the action type based on the GSI1pk
export const getLegacyEventType = (gsi1pk: string, waiverAuthority?: string | null | undefined) => {
  if (gsi1pk === "") {
    return undefined;
  }
  const submitType = gsi1pk.split("OneMAC#submit")?.[1] || "";

  switch (submitType) {
    case "chipspa":
      return "new-chip-submission";
    case "medicaidspa":
      return "new-medicaid-submission";
    case "waiveramendment":
      return waiverAuthority === "1915(b)" ? "capitated-amendment" : "contracting-amendment"; //legacy uses 1915(b) for capitated and 1915(b)(4) for contracting
    case "waiverappk":
      return "app-k";
    case "waiverextension":
    case "waiverextensionb":
    case "waiverextensionc":
      return "temporary-extension";
    case "waivernew":
      return waiverAuthority === "1915(b)" ? "capitated-initial" : "contracting-initial"; //legacy uses 1915(b) for capitated and 1915(b)(4) for contracting
    case "waiverrenewal":
      return waiverAuthority === "1915(b)" ? "capitated-renewal" : "contracting-renewal"; //legacy uses 1915(b) for capitated and 1915(b)(4) for contracting
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
