export function formatActionType(actionType: string | undefined): string {
  switch (actionType) {
    case undefined:
      return "-- --";
    case "New":
      return "Initial";
    case "Amend":
      return "Amendment";
    case "Renew":
      return "Renewal";
    case "Extend":
      return "Temporary Extension Request";
    default:
      return actionType;
  }
}

/**
 * Formats an action type to include the word "waiver" where necessary.
 *
 * This function ensures that the word "waiver" is included in the formatted action type.
 * The placement of "waiver" depends on the specific type:
 * - If the action type is `"Initial"` or `"New"`, it returns `"Initial Waiver"`.
 * - Otherwise, it prepends `"Waiver"` to the formatted action type.
 *
 * This function is designed to work with both unformatted and preformatted action types.
 * `formatActionType` will return the input string if it doesn't match known cases.
 *
 * @param {string} actionType - The action type to format.
 * @returns {string} The formatted action type including "waiver" where applicable.
 */

export function formatActionTypeWithWaiver(actionType: string): string {
  if (actionType === "Initial" || actionType === "New") return "Initial Waiver";
  return `Waiver ${formatActionType(actionType)}`;
}
