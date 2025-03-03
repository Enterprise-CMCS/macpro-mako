export function formatActionType(actionType: string | undefined, waiverText?: boolean): string {
  const waiverInitial = waiverText ? " Waiver" : "";
  const waiverAmend = waiverText ? "Waiver " : "";
  switch (actionType) {
    case undefined:
      return "-- --";
    case "New":
      return `Initial${waiverInitial}`;
    case "Amend":
      return `${waiverAmend}Amendment`;
    case "Renew":
      return `${waiverAmend}Renewal`;
    default:
      return actionType;
  }
}
