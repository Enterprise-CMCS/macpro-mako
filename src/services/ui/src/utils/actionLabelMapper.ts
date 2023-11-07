import { Action } from "shared-types";

export const mapActionLabel = (a: Action) => {
  switch (a) {
    case Action.ENABLE_RAI_WITHDRAW:
      return "Enable RAI Response Withdraw";
    case Action.DISABLE_RAI_WITHDRAW:
      return "Disable RAI Response Withdraw";
  }
};
