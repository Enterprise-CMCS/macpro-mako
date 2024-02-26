import { CognitoUserAttributes, opensearch } from "../../shared-types";
import rules from "./rules";
import { PackageCheck } from "../packageCheck";

export const getAvailableActions = (
  user: CognitoUserAttributes,
  result: opensearch.main.Document,
  isIDM: boolean
) => {
  const checks = PackageCheck(result);
  return [
    ...(checks.isWaiver || checks.isSpa
      ? rules.filter((r) => r.check(checks, user, isIDM)).map((r) => r.action)
      : []),
  ];
};
