import { Action, CognitoUserAttributes, OsMainSourceItem, SEATOOL_STATUS } from "../shared-types";
import { getLatestRai } from './rai-helper'
import { isCmsWriteUser } from './user-helper'
import { isStateUser } from "./user-helper";

export const packageActionsForResult = (
    user: CognitoUserAttributes,
    result: OsMainSourceItem
  ): Action[] => {
    const actions = [] as any[];
    const latestRai = getLatestRai(result?.rais || {});
    if (isCmsWriteUser(user)) {
      switch (result.seatoolStatus) {
        case SEATOOL_STATUS.PENDING:
        case SEATOOL_STATUS.PENDING_OFF_THE_CLOCK:
        case SEATOOL_STATUS.PENDING_APPROVAL:
        case SEATOOL_STATUS.PENDING_CONCURRENCE:
          if (!latestRai || latestRai.status != "requested") {
            // If there is no RAIs, or the latest RAI is in a state other than requested
            actions.push(Action.ISSUE_RAI);
          }
          break;
      }
      if (latestRai?.status == "received") {
        // There's an RAI and its been responded to
        if (!result.raiWithdrawEnabled) {
          actions.push(Action.ENABLE_RAI_WITHDRAW);
        }
        if (result.raiWithdrawEnabled) {
          actions.push(Action.DISABLE_RAI_WITHDRAW);
        }
      }
    } else if (isStateUser(user)) {
      switch (result.seatoolStatus) {
        case SEATOOL_STATUS.PENDING_RAI:
          if (latestRai?.status == "requested") {
            // If there is an active RAI
            actions.push(Action.RESPOND_TO_RAI);
          }
          break;
        case SEATOOL_STATUS.PENDING:
        case SEATOOL_STATUS.PENDING_OFF_THE_CLOCK:
        case SEATOOL_STATUS.PENDING_APPROVAL:
        case SEATOOL_STATUS.PENDING_CONCURRENCE:
          actions.push(Action.WITHDRAW_PACKAGE);
          if (
            latestRai?.status == "received" &&
            result.raiWithdrawEnabled
          ) {
            // There is an rai that's been responded to, but not withdrawn
            actions.push(Action.WITHDRAW_RAI);
          }
          break;
      }
    }
    return actions;
  };