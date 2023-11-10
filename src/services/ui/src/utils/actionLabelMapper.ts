import { Action } from "shared-types";

export const mapActionLabel = (a: Action) => {
  switch (a) {
    case Action.ENABLE_RAI_WITHDRAW:
      return "Enable RAI Response Withdraw";
    case Action.ISSUE_RAI:
      return "Issue RAI";
    case Action.RESPOND_TO_RAI:
      return "Respond to RAI";
  }
};
