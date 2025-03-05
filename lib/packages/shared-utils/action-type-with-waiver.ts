import { formatActionType } from "shared-utils";
// sometimes waiver action type will need to include the word "waiver" but where the word goes is dependent on the type
export function formatActionTypeWithWaiver(actionType: string): string {
  //   this allows the function to work if the action type already ran through the other format function (like for emails)
  //   or not - since formatActionType will return the input string if it doesn't match the switch
  if (actionType === "Initial" || actionType === "New") return "Initial Waiver";
  else return `Waiver ${formatActionType(actionType)}`;
}
