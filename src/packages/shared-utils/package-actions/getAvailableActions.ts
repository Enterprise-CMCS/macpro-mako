import {
  ActionAvailabilityCheck,
  CognitoUserAttributes,
  OsMainSourceItem,
  PlanCheck,
  PlanType,
} from "../../shared-types";
import rules from "./rules";

export const getAvailableActions = (
  user: CognitoUserAttributes,
  result: OsMainSourceItem
) => {
  const checker = ActionAvailabilityCheck(result);
  return PlanCheck(result.planType).is([PlanType.MED_SPA])
    ? rules.filter((r) => r.check(checker, user)).map((r) => r.action)
    : [];
};
