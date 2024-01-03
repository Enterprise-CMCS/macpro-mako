import { Action } from "shared-types";

import { BLANK_VALUE } from "@/consts";
import { Route } from "@/components/Routing/types";

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
  }
};

export const mapSubmissionCrumb = (path: Route) => {
  switch (path) {
    case "/new-submission/spa/medicaid/create":
      return "Submit new Medicaid SPA";
    case "/new-submission/spa/chip/create":
      return "Submit new CHIP SPA";
    default:
      return BLANK_VALUE;
  }
};
