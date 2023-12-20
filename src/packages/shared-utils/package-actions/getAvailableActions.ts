import { CognitoUserAttributes, OsMainSourceItem } from "../../shared-types";
import { getLatestRai } from "../rai-helper";
import rules from "./rules";

export const getAvailableActions = (
  user: CognitoUserAttributes,
  result: OsMainSourceItem
) => {
  const latestRai = getLatestRai(result?.rais || {});
  return rules
    .filter((r) => r.check(result, user, latestRai))
    .map((a) => a.action);
};
