import { OsMainSourceItem } from "./opensearch";
import { CognitoUserAttributes } from "./user";

export enum Action {
  ISSUE_RAI = "issue-rai",
  RESPOND_TO_RAI = "respond-to-rai",
  ENABLE_RAI_WITHDRAW = "enable-rai-withdraw",
  DISABLE_RAI_WITHDRAW = "disable-rai-withdraw",
  WITHDRAW_RAI = "withdraw-rai",
  WITHDRAW_PACKAGE = "withdraw-package",
}

export type ActionRule = {
  action: Action;
  check: (
    data: OsMainSourceItem,
    user: CognitoUserAttributes,
    latestRai: any, // TODO: Type for latestRai
    /** Keep excess parameters to a minimum **/
    ...any: any[]
  ) => boolean;
};
