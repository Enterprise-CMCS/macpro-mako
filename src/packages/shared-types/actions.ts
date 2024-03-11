import { CognitoUserAttributes } from "./user";
import { IPackageCheck } from "shared-utils";

export enum Action {
  ISSUE_RAI = "issue-rai",
  RESPOND_TO_RAI = "respond-to-rai",
  ENABLE_RAI_WITHDRAW = "enable-rai-withdraw",
  DISABLE_RAI_WITHDRAW = "disable-rai-withdraw",
  WITHDRAW_RAI = "withdraw-rai",
  WITHDRAW_PACKAGE = "withdraw-package",
  REMOVE_APPK_CHILD = "remove-appk-child",
  // waiver-only
  AMEND_1915B_CAP = "1915b-capitated-amendment",
  AMEND_1915B_CONT = "1915b-contracting-amendment",
}

export type ActionRule = {
  action: Action;
  check: (
    checker: IPackageCheck,
    user: CognitoUserAttributes,
    /** Keep excess parameters to a minimum **/
    ...any: any[]
  ) => boolean;
};
