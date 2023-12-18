export enum Action {
  ENABLE_RAI_WITHDRAW = "enable-rai-withdraw",
  WITHDRAW_PACKAGE = "withdraw-package",
  DISABLE_RAI_WITHDRAW = "disable-rai-withdraw",
  ISSUE_RAI = "issue-rai",
  WITHDRAW_RAI = "withdraw-rai",
  RESPOND_TO_RAI = "respond-to-rai",
}

export type ActionTypes =
  | "enable-rai-withdraw"
  | "withdraw-package"
  | "disable-rai-withdraw"
  | "issue-rai"
  | "withdraw-rai"
  | "respond-to-rai";
