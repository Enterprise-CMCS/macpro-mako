import {
  Authority,
  CognitoUserAttributes,
  OsMainSourceItem,
} from "../../shared-types";
import { getLatestRai } from "../rai-helper";
import rules from "./rules";
import { removeUnderscoresAndCapitalize } from "ui/src/utils";

export const getAvailableActions = (
  user: CognitoUserAttributes,
  result: OsMainSourceItem
) =>
  result?.planType &&
  [Authority.MED_SPA].includes(
    removeUnderscoresAndCapitalize(result.planType) as Authority
  )
    ? rules
        .filter((r) => r.check(result, user, getLatestRai(result?.rais)))
        .map((a) => a.action)
    : [];
