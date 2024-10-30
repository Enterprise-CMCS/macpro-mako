import {
  Action,
  ActionRule,
  SEATOOL_STATUS,
  finalDispositionStatuses,
} from "shared-types";
import { isStateUser, isCmsWriteUser, isCmsSuperUser } from "../user-helper";

const arRespondToRai: ActionRule = {
  action: Action.RESPOND_TO_RAI,
  check: (checker, user) =>
    !checker.isTempExtension &&
    checker.hasStatus(SEATOOL_STATUS.PENDING_RAI) &&
    checker.hasLatestRai &&
    // safety; prevent bad status from causing overwrite
    (!checker.hasRaiResponse || checker.hasRaiWithdrawal) &&
    isStateUser(user) &&
    !checker.isLocked,
};

const arTempExtension: ActionRule = {
  action: Action.TEMP_EXTENSION,
  check: (checker, user) =>
    checker.hasStatus(SEATOOL_STATUS.APPROVED) &&
    checker.isWaiver &&
    checker.isInitialOrRenewal &&
    isStateUser(user) &&
    false,
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
    isStateUser(user) &&
    !checker.isLocked,
};

const arWithdrawPackage: ActionRule = {
  action: Action.WITHDRAW_PACKAGE,
  check: (checker, user) =>
    !checker.isTempExtension &&
    !checker.hasStatus(finalDispositionStatuses) &&
    isStateUser(user) &&
    !checker.isLocked,
};

const arUpdateId: ActionRule = {
  action: Action.UPDATE_ID,
  check: (checker, user) =>
    isCmsSuperUser(user) &&
    !checker.hasStatus(finalDispositionStatuses) &&
    false,
};

const arRemoveAppkChild: ActionRule = {
  action: Action.REMOVE_APPK_CHILD,
  check: (checker, user) => isStateUser(user) && !!checker.isAppkChild && false,
};

const arUploadSubsequentDocuments: ActionRule = {
  action: Action.UPLOAD_SUBSEQUENT_DOCUMENTS,
  check: (checker, user) => {
    if (checker.hasStatus(SEATOOL_STATUS.PENDING)) {
      if (isStateUser(user)) {
        if (
          checker.hasStatus(SEATOOL_STATUS.PENDING_CONCURRENCE) ||
          checker.hasStatus(SEATOOL_STATUS.PENDING_APPROVAL) ||
          checker.hasLatestRai
        ) {
          return false;
        }

        return true;
      }
    }

    return false;
  },
};

export default [
  arRespondToRai,
  arEnableWithdrawRaiResponse,
  arDisableWithdrawRaiResponse,
  arWithdrawRaiResponse,
  arWithdrawPackage,
  arTempExtension,
  arUpdateId,
  arRemoveAppkChild,
  arUploadSubsequentDocuments,
];
