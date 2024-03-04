import { CognitoUserAttributes, opensearch } from "../../shared-types";
import rules from "./rules";
import { PackageCheck } from "../packageCheck";
import { isIDM } from "../is-idm";

export const getAvailableActions = (
  user: CognitoUserAttributes,
  result: opensearch.main.Document
) => {
  console.log("here is the user object: ", JSON.stringify(user));
  console.log("the sub is: ", user);
  console.log("the user is idm: ", isIDM(user.identities));

  const checks = PackageCheck(result);
  return [
    ...(checks.isWaiver || checks.isSpa
      ? rules.filter((r) => r.check(checks, user)).map((r) => r.action)
      : []),
  ];
};
