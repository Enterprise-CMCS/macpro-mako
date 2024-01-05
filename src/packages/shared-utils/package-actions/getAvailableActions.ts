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
  return checks.planTypeIs([PlanType.MED_SPA])
    ? rules.filter((r) => r.check(checks, user)).map((r) => r.action)
    : [];

};