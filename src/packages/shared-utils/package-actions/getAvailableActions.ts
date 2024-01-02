import {
  CognitoUserAttributes,
  OsMainSourceItem,
  PlanType,
} from "../../shared-types";
import rules from "./rules";
import { PackageCheck } from "../packageCheck";

export const getAvailableActions = (
  user: CognitoUserAttributes,
  result: OsMainSourceItem
) => {
  const checks = PackageCheck(result);
  // We are only authorizing actions for SPAs at this point in time. Once waivers are added,
  // this return should be non-conditional and rely on the `r.check()` to authorize
  // plan types as needed.
  return checks.isSpa
    ? rules.filter((r) => r.check(checks, user)).map((r) => r.action)
    : [];
};
