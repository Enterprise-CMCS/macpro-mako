import { Action, CognitoUserAttributes, opensearch } from "../../shared-types";
import { PackageCheck } from "../package-check";
import rules from "./rules";

export const getAvailableActions = (
  user: CognitoUserAttributes,
  result: opensearch.main.Document,
) => {
  const allActions: Action[][] = [];

  const allMembers = [result];

  if (result.appkChildren) {
    allMembers.push(...result.appkChildren.map((el) => el._source));
  }

  allMembers.forEach((element) => {
    const checks = PackageCheck(element);
    allActions.push([
      ...(checks.isWaiver || checks.isSpa
        ? rules.filter((r) => r.check(checks, user)).map((r) => r.action)
        : []),
    ]);
  });

  let commonActions = allActions.reduce((acc, currentActions, index) => {
    if (index === 0) return currentActions;
    return acc.filter((action: Action) => currentActions.includes(action));
  }, []);

  const allRaiRequestedDates = allMembers
    .filter((member) => (member as opensearch.main.SeatoolDocument)?.raiRequestedDate !== undefined)
    .map((member) => (member as opensearch.main.SeatoolDocument)?.raiRequestedDate);
  const isRaiRequestedDateIdentical = allRaiRequestedDates.every((date, _, arr) => date === arr[0]);
  if (!isRaiRequestedDateIdentical) {
    const actionsToRemove = [Action.RESPOND_TO_RAI, Action.WITHDRAW_RAI];
    commonActions = commonActions.filter((action: any) => !actionsToRemove.includes(action));
  }
  return commonActions;
};
