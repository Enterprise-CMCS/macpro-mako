export function formatActionType(actionType: string): string {
  switch (actionType) {
    case "New":
      return "Initial";
    case "Amend":
      return "Amendment";
    default:
      return actionType;
  }
}
