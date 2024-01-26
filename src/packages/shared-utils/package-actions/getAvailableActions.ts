import {
  CognitoUserAttributes,
  PlanType,
  opensearch,
  ActionRule,
} from "../../shared-types";
import rules from "./rules";
import { PackageCheck } from "../packageCheck";

export const getAvailableActions = (
  user: CognitoUserAttributes,
  result: opensearch.main.Document
): Omit<ActionRule, "check">[] => {
  const checks = PackageCheck(result);
  return rules
    .filter((r) => r.check(checks, user))
    .map((r) => ({
      action: r.action,
      url: r.url,
    }));
};
