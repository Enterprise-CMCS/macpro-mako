import { formatActionType } from "node_modules/shared-utils";

export const actionTypeWithWaiver = (actionType: string): string => {
  if (actionType === "Initial" || actionType === "New") return "Initial Waiver";
  else return `Waiver ${formatActionType(actionType)}`;
};
