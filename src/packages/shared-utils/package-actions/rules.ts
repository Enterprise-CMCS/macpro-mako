import {
  Action,
  ActionRule,
  Authority,
  finalDispositionStatuses,
  SEATOOL_STATUS,
} from "shared-types";
import { isCmsWriteUser, isIDM, isStateUser } from "../user-helper";

const arIssueRai: ActionRule = {
  action: Action.ISSUE_RAI,
  check: (checker, user) =>
    checker.isInActivePendingStatus &&
    // Doesn't have any RAIs
    (!checker.hasLatestRai ||
      // The latest RAI is complete
      (checker.hasCompletedRai &&
        // The package is not a medicaid spa (med spas only get 1 rai)
        !checker.authorityIs([Authority.MED_SPA]) &&
        // The package does not have RAI Response Withdraw enabled
        !checker.hasEnabledRaiWithdraw)) &&
    isCmsWriteUser(user) &&
    !isIDM(user),
};

const arRespondToRai: ActionRule = {
  action: Action.RESPOND_TO_RAI,
  check: (checker, user) =>
    checker.hasStatus(SEATOOL_STATUS.PENDING_RAI) &&
    checker.hasRequestedRai &&
    isStateUser(user),
};

const arEnableWithdrawRaiResponse: ActionRule = {
  action: Action.ENABLE_RAI_WITHDRAW,
  check: (checker, user) =>
    checker.isNotWithdrawn &&
    checker.hasRaiResponse &&
    !checker.hasEnabledRaiWithdraw &&
    isCmsWriteUser(user) &&
    !checker.hasStatus(finalDispositionStatuses),
};

const arDisableWithdrawRaiResponse: ActionRule = {
  action: Action.DISABLE_RAI_WITHDRAW,
  check: (checker, user) =>
    checker.isNotWithdrawn &&
    checker.hasRaiResponse &&
    checker.hasEnabledRaiWithdraw &&
    isCmsWriteUser(user) &&
    !checker.hasStatus(finalDispositionStatuses),
};

const arWithdrawRaiResponse: ActionRule = {
  action: Action.WITHDRAW_RAI,
  check: (checker, user) =>
    checker.isInActivePendingStatus &&
    checker.hasRaiResponse &&
    checker.hasEnabledRaiWithdraw &&
    isStateUser(user),
};

const arWithdrawPackage: ActionRule = {
  action: Action.WITHDRAW_PACKAGE,
  check: (checker, user) =>
    !checker.hasStatus(finalDispositionStatuses) && isStateUser(user),
};

// TODO: Add rule for remove-appk-child

const arAmendBCAPWaiver: ActionRule = {
  action: Action.AMEND_1915B_CAP,
  check: (checker, user) =>
    checker.isWaiver &&
    (checker.isRenewal || checker.isInitial) &&
    checker.hasStatus("Approved"),
};

const arAmendBCONTWaiver: ActionRule = {
  action: Action.AMEND_1915B_CONT,
  check: (checker, user) =>
    checker.isWaiver &&
    (checker.isRenewal || checker.isInitial) &&
    checker.hasStatus("Approved"),
};

export default [
  arIssueRai,
  arRespondToRai,
  arEnableWithdrawRaiResponse,
  arDisableWithdrawRaiResponse,
  arWithdrawRaiResponse,
  arWithdrawPackage,
  // for waivers only
  arAmendBCONTWaiver,
  arAmendBCAPWaiver,
];
