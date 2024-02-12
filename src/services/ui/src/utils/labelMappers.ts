import { Action } from "shared-types";

import { BLANK_VALUE } from "@/consts";
import { Route } from "@/components";

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
    case "/new-submission/waiver/b/capitated/initial/create":
      return "1915(b) Comprehensive (Capitated) New Initial Waiver";
    case "/new-submission/waiver/b/capitated/renewal/create":
      return "1915(b) Comprehensive (Capitated) Renewal Waiver";
    case "/new-submission/waiver/b/capitated/amend/create":
      return "1915(b) Comprehensive (Capitated) Waiver Amendment";
    case "/new-submission/waiver/b/b4/initial/create":
      return "1915(b)(4) FFS Selective Contracting Initial Waiver";
    case "/new-submission/waiver/b/b4/renewal/create":
      return "1915(b)(4) FFS Selective Contracting Renewal Waiver";
    case "/new-submission/waiver/b/b4/amendment/create":
      return "1915(b)(4) FFS Selective Contracting Waiver Amendment";
    default:
      return BLANK_VALUE;
  }
};
