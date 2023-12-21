import {
  Authority,
  CognitoUserAttributes,
  OsMainSourceItem,
} from "../../shared-types";
import { getLatestRai } from "../rai-helper";
import rules from "./rules";

export const getAvailableActions = (
  user: CognitoUserAttributes,
  result: OsMainSourceItem
) =>
  result?.planType && [Authority.MED_SPA].includes(result.planType)
    ? rules
        .filter((r) => r.check(result, user, getLatestRai(result?.rais)))
        .map((a) => a.action)
    : [];
