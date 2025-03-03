export function formatActionType(
  actionType: string | undefined,
  waiverInString: boolean = true,
): string {
  const waiverWord = waiverInString ? "Waiver" : "";
  const space = waiverInString ? " " : "";

  switch (actionType) {
    case undefined:
      return "-- --";
    case "New":
      return `Initial${space}${waiverWord}`;
    case "Amend":
      return `${waiverWord}${space}Amendment`;
    case "Renew":
      return `${waiverWord}${space}Renewal`;
    default:
      return actionType;
  }
}
