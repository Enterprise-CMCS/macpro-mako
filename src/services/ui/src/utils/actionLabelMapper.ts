import { Action } from "shared-types";

export const mapActionLabel = (a: Action) => {
  switch (a) {
    case Action.ENABLE_RAI_WITHDRAW:
      return "Enable Formal RAI Response Withdraw";
    case Action.DISABLE_RAI_WITHDRAW:
      return "Disable Formal RAI Response Withdraw";
    case Action.ISSUE_RAI:
      return "Issue RAI";
    case Action.WITHDRAW_RAI:
      return "Withdraw RAI";
  }
};
