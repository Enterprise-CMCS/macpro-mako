import { Action, CognitoUserAttributes, opensearch } from "../../shared-types";
import rules from "./rules";
import { haveSameRaiDate, PackageCheck } from "../package-check";

export const getAvailableActions = (
  user: CognitoUserAttributes,
  result: opensearch.main.Document,
) => {
  const checks = PackageCheck(result);
  const actions = rules
    .filter((r) => r.check(checks, user))
    .map((r) => r.action);
  // Normal and AppK child packages return here
  if (!result.appkParent || !result.appkChildren?.length) return actions;
  // AppK children action bundling
  const childrenActions: Action[][] = result.appkChildren.map((child) =>
    getAvailableActions(user, child._source),
  );
  // We only want common actions; omit actions not in every AppK package
  const commonActions = [actions, ...childrenActions].reduce(
    (acc, currentActions, idx) =>
      idx === 0
        ? currentActions
        : acc.filter((action) => currentActions.includes(action)),
    [],
  );
  /* Remove RAI actions unless the RAI requested date is identical across all appk members
   * Scenario: If the parent and the children all have respond to rai as an available action
   *    But one of those children's latest rai has a different requested date (raitable in seetool)
   *    There's drift, and there will be a failure when going to write the response
   *    Further, we can't reliably know what RAI is correct. */
  const allMembers = [result, ...result.appkChildren!.map((c) => c._source)];
  return !haveSameRaiDate(allMembers)
    ? commonActions.filter((a) => {
        return ![
          Action.RESPOND_TO_RAI,
          Action.WITHDRAW_RAI,
          Action.ISSUE_RAI,
        ].includes(a);
      })
    : commonActions;
};
