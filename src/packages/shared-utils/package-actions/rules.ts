import {
  Action,
  ActionRule,
  Authority,
  SEATOOL_STATUS,
  finalDispositionStatuses,
} from "shared-types";
import {
  isStateUser,
  isCmsWriteUser,
  isIDM,
  isCmsSuperUser,
} from "../user-helper";

const arIssueRai: ActionRule = {
  action: Action.ISSUE_RAI,
  check: (checker, user) =>
    !checker.isTempExtension &&
    checker.isInActivePendingStatus &&
    // Doesn't have any RAIs
    (!checker.hasLatestRai ||
      // The latest RAI is complete
      (checker.hasCompletedRai &&
        // The package is a chip (chips can have more than 1 rai)
        checker.authorityIs([Authority.CHIP_SPA]) &&
        // The package does not have RAI Response Withdraw enabled
        !checker.hasEnabledRaiWithdraw)) &&
    isCmsWriteUser(user) &&
    !isIDM(user),
};

const arRespondToRai: ActionRule = {
  action: Action.RESPOND_TO_RAI,
  check: (checker, user) =>
    !checker.isTempExtension &&
    checker.hasStatus(SEATOOL_STATUS.PENDING_RAI) &&
    checker.hasLatestRai &&
    // safety; prevent bad status from causing overwrite
    (!checker.hasRaiResponse || checker.hasRaiWithdrawal) &&
    isStateUser(user),
};

const arTempExtension: ActionRule = {
  action: Action.TEMP_EXTENSION,
  check: (checker, user) =>
    checker.hasStatus(SEATOOL_STATUS.APPROVED) &&
    checker.isWaiver &&
    checker.isInitialOrRenewal &&
    isStateUser(user),
};

const arEnableWithdrawRaiResponse: ActionRule = {
  action: Action.ENABLE_RAI_WITHDRAW,
  check: (checker, user) =>
    !checker.isTempExtension &&
    checker.isNotWithdrawn &&
    checker.hasRaiResponse &&
    !checker.hasEnabledRaiWithdraw &&
    isCmsWriteUser(user) &&
    !checker.hasStatus(finalDispositionStatuses),
};

const arDisableWithdrawRaiResponse: ActionRule = {
  action: Action.DISABLE_RAI_WITHDRAW,
  check: (checker, user) =>
    !checker.isTempExtension &&
    checker.isNotWithdrawn &&
    checker.hasRaiResponse &&
    checker.hasEnabledRaiWithdraw &&
    isCmsWriteUser(user) &&
    !checker.hasStatus(finalDispositionStatuses),
};

const arWithdrawRaiResponse: ActionRule = {
  action: Action.WITHDRAW_RAI,
  check: (checker, user) =>
    !checker.isTempExtension &&
    checker.isInActivePendingStatus &&
    checker.hasRaiResponse &&
    // safety; prevent bad status from causing overwrite
    !checker.hasRaiWithdrawal &&
    checker.hasEnabledRaiWithdraw &&
    isStateUser(user),
};
const arWithdrawPackage: ActionRule = {
  action: Action.WITHDRAW_PACKAGE,
  check: (checker, user) =>
    !checker.isTempExtension &&
    !checker.hasStatus(finalDispositionStatuses) &&
    isStateUser(user),
};
const arUpdateId: ActionRule = {
  action: Action.UPDATE_ID,
  check: (checker, user) =>
    isCmsSuperUser(user) && !checker.hasStatus(finalDispositionStatuses),
};
const arPerformIntake: ActionRule = {
  action: Action.PERFORM_INTAKE,
  check: (checker, user) => isCmsWriteUser(user) && checker.needsIntake,
};

// TODO: Add rule for remove-appk-child

export default [
  arIssueRai,
  arRespondToRai,
  arEnableWithdrawRaiResponse,
  arDisableWithdrawRaiResponse,
  arWithdrawRaiResponse,
  arWithdrawPackage,
  arTempExtension,
  arUpdateId,
  arPerformIntake,
];
