import { Action } from "shared-types";
import { ROUTES } from "@/routes";
import { BLANK_VALUE } from "@/consts";

export const mapActionLabel = (a: Action) => {
  switch (a) {
    case Action.ENABLE_RAI_WITHDRAW:
      return "Enable Formal RAI Response Withdraw";
    case Action.DISABLE_RAI_WITHDRAW:
      return "Disable Formal RAI Response Withdraw";
    case Action.ISSUE_RAI:
      return "Issue Formal RAI";
    case Action.WITHDRAW_RAI:
      return "Withdraw Formal RAI Response";
    case Action.RESPOND_TO_RAI:
      return "Respond to Formal RAI";
  }
};

export const mapSubmissionCrumb = (path: ROUTES) => {
  switch (path) {
    case ROUTES.MEDICAID_NEW:
      return "Submit new Medicaid SPA";
    case ROUTES.CHIP_NEW:
      return "Submit new CHIP SPA";
    default:
      return BLANK_VALUE;
  }
};
