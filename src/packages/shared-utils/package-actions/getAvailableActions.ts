import {
  CognitoUserAttributes,
  opensearch,
} from "../../shared-types";
import rules from "./rules";
import { PackageCheck } from "../package-check";

export const getAvailableActions = (
  user: CognitoUserAttributes,
  result: opensearch.main.Document
) => {
  const checks = PackageCheck(result);
  return [
    ...((checks.isWaiver || checks.isSpa)
      ? rules.filter((r) => r.check(checks, user)).map((r) => r.action)
      : []),
  ];
};
