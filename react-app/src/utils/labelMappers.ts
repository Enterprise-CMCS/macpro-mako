import { Action } from "shared-types/actions";

export const mapActionLabel = (a: Action) => {
  switch (a) {
    case Action.ENABLE_RAI_WITHDRAW:
      return "Enable Formal RAI Response Withdraw";
    case Action.DISABLE_RAI_WITHDRAW:
      return "Disable Formal RAI Response Withdraw";
    case Action.ISSUE_RAI:
      return "Issue Formal RAI";
    case Action.WITHDRAW_PACKAGE:
      return "Withdraw Package";
    case Action.WITHDRAW_RAI:
      return "Withdraw Formal RAI Response";
    case Action.RESPOND_TO_RAI:
      return "Respond to Formal RAI";
    case Action.TEMP_EXTENSION:
      return "Request Temporary Extension";
    case Action.AMEND_WAIVER:
      return "Add Amendment";
    case Action.UPDATE_ID:
      return "Update ID";
    default:
      return "";
  }
};
