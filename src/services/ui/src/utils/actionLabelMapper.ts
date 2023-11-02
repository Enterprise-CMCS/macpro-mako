import { Action } from "shared-types";
import { ActionForms } from "@/pages";

export const mapActionLabel = (a: Action) => {
  switch (a) {
    case Action.ENABLE_RAI_WITHDRAW:
      return "Enable RAI Response Withdraw";
  }
};

export const mapActionLink = (a: Action): string => {
  const prefixed = (route: ActionForms) => `/action/${route}`;
  switch (a) {
    case Action.ENABLE_RAI_WITHDRAW:
      return prefixed(ActionForms.ENABLE_RAI_WITHDRAW);
  }
};
