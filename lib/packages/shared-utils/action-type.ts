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
