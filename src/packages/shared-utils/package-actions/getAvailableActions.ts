import {
  CognitoUserAttributes,
  PlanType,
  opensearch
} from "../../shared-types";
import rules from "./rules";
import { PackageCheck } from "../packageCheck";

export const getAvailableActions = (
  user: CognitoUserAttributes,
  result: opensearch.main.Document
) => {
  const checks = PackageCheck(result);
  return checks.planTypeIs([PlanType.MED_SPA])
    ? rules.filter((r) => r.check(checks, user)).map((r) => r.action)
    : [];
};
