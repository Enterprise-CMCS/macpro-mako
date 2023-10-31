import { Action } from "shared-types";
import { ROUTES } from "@/routes";
export const mapActionLabel = (a: Action) => {
  switch (a) {
    case Action.ENABLE_RAI_WITHDRAW:
      return "Enable RAI Response Withdraw";
  }
};

export const mapActionLink = (a: Action): ROUTES => {
  switch (a) {
    case Action.ENABLE_RAI_WITHDRAW:
      return ROUTES.DASHBOARD;
  }
};
