import { Action, ActionRule, SEATOOL_STATUS } from "../../shared-types";
import { isCmsUser, isStateUser, isCmsReadonlyUser } from "../user-helper";
import { PackageCheck } from "../packageCheck";

const arIssueRai: ActionRule = {
  action: Action.ISSUE_RAI,
  check: (checker, user) =>
    !isCmsReadonlyUser(user) &&
    checker.isInActivePendingStatus &&
    (!checker.hasLatestRai || checker.hasRequestedRai) &&
    isCmsUser(user),
};

const arRespondToRai: ActionRule = {
  action: Action.RESPOND_TO_RAI,
  check: (checker, user) =>
    !isCmsReadonlyUser(user) &&
    checker.hasStatus(SEATOOL_STATUS.PENDING_RAI) &&
    checker.hasRequestedRai &&
    isStateUser(user),
};

const arEnableWithdrawRaiResponse: ActionRule = {
  action: Action.ENABLE_RAI_WITHDRAW,
  check: (checker, user) =>
    !isCmsReadonlyUser(user) &&
    checker.isNotWithdrawn &&
    checker.hasRaiResponse &&
    !checker.hasEnabledRaiWithdraw &&
    isCmsUser(user),
};

const arDisableWithdrawRaiResponse: ActionRule = {
  action: Action.DISABLE_RAI_WITHDRAW,
  check: (checker, user) =>
    !isCmsReadonlyUser(user) &&
    checker.isNotWithdrawn &&
    checker.hasRaiResponse &&
    checker.hasEnabledRaiWithdraw &&
    isCmsUser(user),
};

const arWithdrawRaiResponse: ActionRule = {
  action: Action.WITHDRAW_RAI,
  check: (checker, user) =>
    !isCmsReadonlyUser(user) &&
    checker.isInActivePendingStatus &&
    checker.hasRaiResponse &&
    checker.hasEnabledRaiWithdraw &&
    isStateUser(user),
};

const arWithdrawPackage: ActionRule = {
  action: Action.WITHDRAW_PACKAGE,
  check: (checker, user) =>
    !isCmsReadonlyUser(user) &&
    ((checker.hasStatus(SEATOOL_STATUS.PENDING_RAI) &&
      checker.hasRequestedRai)
      || checker.isInActivePendingStatus)
    && isStateUser(user),
};

export default [
  arIssueRai,
  arRespondToRai,
  arEnableWithdrawRaiResponse,
  arDisableWithdrawRaiResponse,
  arWithdrawRaiResponse,
  arWithdrawPackage,
];
