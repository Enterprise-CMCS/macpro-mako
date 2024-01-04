import {
  ActionAvailabilityCheck,
  CognitoUserAttributes,
  PlanTypeCheck,
  PlanType,
  opensearch
} from "../../shared-types";
import rules from "./rules";

export const getAvailableActions = (
  user: CognitoUserAttributes,
  result: opensearch.main.Document
) => {
  const actionChecker = ActionAvailabilityCheck(result);
  return PlanTypeCheck(result.planType).is([PlanType.MED_SPA])
    ? rules.filter((r) => r.check(actionChecker, user)).map((r) => r.action)
    : [];
};
