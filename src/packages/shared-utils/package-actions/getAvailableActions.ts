import {
  ActionAvailabilityCheck,
  CognitoUserAttributes,
  OsMainSourceItem,
  PlanTypeCheck,
  PlanType,
} from "../../shared-types";
import rules from "./rules";

export const getAvailableActions = (
  user: CognitoUserAttributes,
  result: OsMainSourceItem
) => {
  const actionChecker = ActionAvailabilityCheck(result);
  return PlanTypeCheck(result.planType).is([PlanType.MED_SPA])
    ? rules.filter((r) => r.check(actionChecker, user)).map((r) => r.action)
    : [];
};
