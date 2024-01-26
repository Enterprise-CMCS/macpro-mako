import { CognitoUserAttributes } from "./user";
import { IPackageCheck } from "shared-utils";

export enum Action {
  ISSUE_RAI = "issue-rai",
  RESPOND_TO_RAI = "respond-to-rai",
  ENABLE_RAI_WITHDRAW = "enable-rai-withdraw",
  DISABLE_RAI_WITHDRAW = "disable-rai-withdraw",
  WITHDRAW_RAI = "withdraw-rai",
  WITHDRAW_PACKAGE = "withdraw-package",

  // Waiver Exclusives
  RENEW_WAIVER = "renew-waiver",
  AMEND_WAIVER = "amend-waiver",
}

type BWaiverSubtype = "b4" | "capitated";
type BWaiverActionType = "renewal" | "amendment";
type ActionUrlBuilder = (
  id: string
) =>
  | `/action/${string}/${Action}`
  | `/new-submission/waiver/b/${BWaiverSubtype}/${BWaiverActionType}/create?id=${string}`;
export type ActionRule = {
  action: Action;
  url: ActionUrlBuilder;
  check: (
    checker: IPackageCheck,
    user: CognitoUserAttributes,
    /** Keep excess parameters to a minimum **/
    ...any: any[]
  ) => boolean;
};
