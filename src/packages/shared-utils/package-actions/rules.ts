import {
  Action,
  ActionAvailabilityCheck,
  ActionRule,
  SEATOOL_STATUS,
} from "../../shared-types";
import { isCmsUser, isStateUser } from "../user-helper";

const arIssueRai: ActionRule = {
  action: Action.ISSUE_RAI,
  // TODO: Do we wanna hide it?
  check: (data, user, latestRai) =>
    ActionAvailabilityCheck.isInRaiStatus(data.seatoolStatus) &&
    isCmsUser(user) &&
    (!latestRai || latestRai.status != "requested"),
};

const arRespondToRai: ActionRule = {
  action: Action.RESPOND_TO_RAI,
  check: (data, user, latestRai) =>
    ActionAvailabilityCheck.isInStatus(data.seatoolStatus, [
      SEATOOL_STATUS.PENDING_RAI,
    ]) &&
    isStateUser(user) &&
    latestRai?.status == "requested",
};

const arEnableWithdrawRaiResponse: ActionRule = {
  action: Action.ENABLE_RAI_WITHDRAW,
  check: (data, user, latestRai) =>
    ActionAvailabilityCheck.isNotWithdrawn(data.seatoolStatus) &&
    isCmsUser(user) &&
    latestRai?.status == "received" &&
    !data?.raiWithdrawEnabled,
};

const arDisableWithdrawRaiResponse: ActionRule = {
  action: Action.DISABLE_RAI_WITHDRAW,
  check: (data, user, latestRai) =>
    ActionAvailabilityCheck.isNotWithdrawn(data.seatoolStatus) &&
    isCmsUser(user) &&
    latestRai?.status == "received" &&
    data?.raiWithdrawEnabled,
};

const arWithdrawRaiResponse: ActionRule = {
  action: Action.WITHDRAW_RAI,
  check: (data, user, latestRai) =>
    ActionAvailabilityCheck.isInRaiStatus(data.seatoolStatus) &&
    isStateUser(user) &&
    latestRai?.status == "received" &&
    data?.raiWithdrawEnabled,
};

const arWithdrawPackage: ActionRule = {
  action: Action.WITHDRAW_PACKAGE,
  check: (data, user) =>
    ActionAvailabilityCheck.isNotWithdrawn(data.seatoolStatus) &&
    isStateUser(user),
};

export default [
  arIssueRai,
  arRespondToRai,
  arEnableWithdrawRaiResponse,
  arDisableWithdrawRaiResponse,
  arWithdrawRaiResponse,
  arWithdrawPackage,
];
