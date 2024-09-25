import { Action } from "shared-types/actions";

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
    case Action.TEMP_EXTENSION:
      return "Request Temporary Extension";
    case Action.UPDATE_ID:
      return "Update ID";
    default:
      return "";
  }
};

export const mapSubmissionCrumb = (path: Route) => {
  switch (path) {
    case "/new-submission/spa/medicaid/create":
      return "Submit new Medicaid SPA";
    case "/new-submission/spa/chip/create":
      return "Submit new CHIP SPA";
    case "/new-submission/waiver/b/capitated/initial/create":
      return "1915(b) Comprehensive (Capitated) Initial Waiver";
    case "/new-submission/waiver/b/capitated/renewal/create":
      return "1915(b) Comprehensive (Capitated) Renewal Waiver";
    case "/new-submission/waiver/b/capitated/amendment/create":
      return "1915(b) Comprehensive (Capitated) Waiver Amendment";
    case "/new-submission/waiver/b/b4/initial/create":
      return "1915(b)(4) FFS Selective Contracting Initial Waiver";
    case "/new-submission/waiver/b/b4/renewal/create":
      return "1915(b)(4) FFS Selective Contracting Renewal Waiver";
    case "/new-submission/waiver/b/b4/amendment/create":
      return "1915(b)(4) FFS Selective Contracting Waiver Amendment";
    case "/new-submission/waiver/app-k":
      return "Request a 1915(c) Appendix K Amendment";
    case "/new-submission/waiver/temporary-extensions":
      return "Request 1915(b) or 1915(c) Temporary Extension";
    default:
      return BLANK_VALUE;
  }
};
