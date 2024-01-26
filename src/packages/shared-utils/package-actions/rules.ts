import {
  Action,
  ActionRule,
  SEATOOL_STATUS,
  finalDispositionStatuses,
} from "../../shared-types";
import { isStateUser, isCmsWriteUser } from "../user-helper";

const arIssueRai: ActionRule = {
  action: Action.ISSUE_RAI,
  url: (id: string) => `/action/${id}/issue-rai`,
  check: (checker, user) =>
    checker.isSpa &&
    checker.isInActivePendingStatus &&
    (!checker.hasLatestRai || checker.hasRequestedRai) &&
    isCmsWriteUser(user),
};

const arRespondToRai: ActionRule = {
  action: Action.RESPOND_TO_RAI,
  url: (id: string) => `/action/${id}/respond-to-rai`,
  check: (checker, user) =>
    checker.isSpa &&
    checker.hasStatus(SEATOOL_STATUS.PENDING_RAI) &&
    checker.hasRequestedRai &&
    isStateUser(user),
};

const arEnableWithdrawRaiResponse: ActionRule = {
  action: Action.ENABLE_RAI_WITHDRAW,
  url: (id: string) => `/action/${id}/enable-rai-withdraw`,
  check: (checker, user) =>
    checker.isSpa &&
    checker.isNotWithdrawn &&
    checker.hasRaiResponse &&
    !checker.hasEnabledRaiWithdraw &&
    isCmsWriteUser(user),
};

const arDisableWithdrawRaiResponse: ActionRule = {
  action: Action.DISABLE_RAI_WITHDRAW,
  url: (id: string) => `/action/${id}/disable-rai-withdraw`,
  check: (checker, user) =>
    checker.isSpa &&
    checker.isNotWithdrawn &&
    checker.hasRaiResponse &&
    checker.hasEnabledRaiWithdraw &&
    isCmsWriteUser(user),
};

const arWithdrawRaiResponse: ActionRule = {
  action: Action.WITHDRAW_RAI,
  url: (id: string) => `/action/${id}/withdraw-rai`,
  check: (checker, user) =>
    checker.isSpa &&
    checker.isInActivePendingStatus &&
    checker.hasRaiResponse &&
    checker.hasEnabledRaiWithdraw &&
    isStateUser(user),
};

const arWithdrawPackage: ActionRule = {
  action: Action.WITHDRAW_PACKAGE,
  url: (id: string) => `/action/${id}/withdraw-package`,
  check: (checker, user) =>
    checker.isSpa &&
    !checker.hasStatus(finalDispositionStatuses) &&
    isStateUser(user),
};

// TODO: Confirm rule
const arRenewWaiver: ActionRule = {
  action: Action.RENEW_WAIVER,
  url: (id: string) => `/new-submission/waiver/b/b4/renewal/create?id=${id}`,
  check: (checker, user) => checker.isSpa && isStateUser(user),
};

// TODO: Confirm rule
const arAmendWaiver: ActionRule = {
  action: Action.AMEND_WAIVER,
  url: (id: string) => `/new-submission/waiver/b/b4/amendment/create?id=${id}`,
  check: (checker, user) => checker.isSpa && isStateUser(user),
};

export default [
  arIssueRai,
  arRespondToRai,
  arEnableWithdrawRaiResponse,
  arDisableWithdrawRaiResponse,
  arWithdrawRaiResponse,
  arWithdrawPackage,
  // Waiver Exclusives
  arRenewWaiver,
  arAmendWaiver,
];
