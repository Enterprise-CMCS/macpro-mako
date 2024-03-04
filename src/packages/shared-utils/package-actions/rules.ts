import {
  Action,
  ActionRule,
  Authority,
  SEATOOL_STATUS,
  finalDispositionStatuses,
} from "../../shared-types";
import { isIDM } from "../is-idm";
import { isStateUser, isCmsWriteUser } from "../user-helper";

const arIssueRai: ActionRule = {
  action: Action.ISSUE_RAI,
  check: (checker, user) => {
    if (isIDM(user.identities)) {
      return false;
    }

    return (
      checker.isInActivePendingStatus &&
      // Doesn't have any RAIs
      (!checker.hasLatestRai ||
        // The latest RAI is complete
        (checker.hasCompletedRai &&
          // The package is not a medicaid spa (med spas only get 1 rai)
          !checker.authorityIs([Authority.MED_SPA]) &&
          // The package does not have RAI Response Withdraw enabled
          !checker.hasEnabledRaiWithdraw)) &&
      isCmsWriteUser(user)
    );
  },
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
    isCmsWriteUser(user),
};

const arDisableWithdrawRaiResponse: ActionRule = {
  action: Action.DISABLE_RAI_WITHDRAW,
  check: (checker, user) =>
    checker.isNotWithdrawn &&
    checker.hasRaiResponse &&
    checker.hasEnabledRaiWithdraw &&
    isCmsWriteUser(user),
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
  check: (checker, user) => {
    return !checker.hasStatus(finalDispositionStatuses) && isStateUser(user);
  },
};

// TODO: Add rule for remove-appk-child

export default [
  arIssueRai,
  arRespondToRai,
  arEnableWithdrawRaiResponse,
  arDisableWithdrawRaiResponse,
  arWithdrawRaiResponse,
  arWithdrawPackage,
];
