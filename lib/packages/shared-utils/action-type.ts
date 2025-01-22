export function formatActionType(actionType: string): string {
  return actionType === "New" ? "Initial" : actionType;
}
