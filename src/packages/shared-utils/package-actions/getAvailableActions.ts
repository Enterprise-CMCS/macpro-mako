import {
  CognitoUserAttributes,
  OsMainSourceItem,
  PlanCheck,
  PlanType,
} from "../../shared-types";
import { getLatestRai } from "../rai-helper";
import rules from "./rules";

export const getAvailableActions = (
  user: CognitoUserAttributes,
  result: OsMainSourceItem
) =>
  PlanCheck(result.planType).is([PlanType.CHIP_SPA])
    ? rules
        .filter((r) => r.check(result, user, getLatestRai(result?.rais)))
        .map((a) => a.action)
    : [];
