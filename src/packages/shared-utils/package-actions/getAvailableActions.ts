import {
  CognitoUserAttributes,
  OsMainSourceItem,
  PlanCheck,
  PlanType,
} from "../../shared-types";
import rules from "./rules";
import { getLatestRai } from "../rai-helper";

export const getAvailableActions = (
  user: CognitoUserAttributes,
  result: OsMainSourceItem
) =>
  PlanCheck(result.planType).is([PlanType.MED_SPA])
    ? rules
        .filter((r) => r.check(result, user, getLatestRai(result?.rais)))
        .map((a) => a.action)
    : [];
