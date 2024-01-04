import {
  CognitoUserAttributes,
  OsMainSourceItem,
  PlanType,
} from "../../shared-types";
import { Action } from '../../shared-types/actions'
import rules from "./rules";
import { PackageCheck } from "../packageCheck";

export const getAvailableActions = (
  user: CognitoUserAttributes,
  result: OsMainSourceItem
) => {
  const checks = PackageCheck(result);
  const finalChecks = checks.planTypeIs([PlanType.MED_SPA])
    ? rules.filter((r) => r.check(checks, user)).map((r) => r.action)
    : [];

  // checking if the package is 
  if (finalChecks?.includes(Action.RESPOND_TO_RAI)) {
    finalChecks.push(Action.WITHDRAW_PACKAGE)
  }
  return finalChecks
};