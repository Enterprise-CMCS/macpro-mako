import { OsMainSourceItem } from "./opensearch";
import { CognitoUserAttributes } from "./user";
import { LatestRai } from "shared-utils";
import { SEATOOL_STATUS, SeatoolStatus } from "./statusHelper";

export enum Action {
  ISSUE_RAI = "issue-rai",
  RESPOND_TO_RAI = "respond-to-rai",
  ENABLE_RAI_WITHDRAW = "enable-rai-withdraw",
  DISABLE_RAI_WITHDRAW = "disable-rai-withdraw",
  WITHDRAW_RAI = "withdraw-rai",
  WITHDRAW_PACKAGE = "withdraw-package",
}
const raiStatuses = [
  SEATOOL_STATUS.PENDING,
  SEATOOL_STATUS.PENDING_OFF_THE_CLOCK,
  SEATOOL_STATUS.PENDING_APPROVAL,
  SEATOOL_STATUS.PENDING_CONCURRENCE,
];
export const ActionAvailabilityCheck = {
  isInRaiStatus: (seatoolStatus: SeatoolStatus) =>
    raiStatuses.includes(seatoolStatus),
  isNotWithdrawn: (seatoolStatus: SeatoolStatus) =>
    seatoolStatus !== SEATOOL_STATUS.WITHDRAWN,
  isInStatus: (
    seatoolStatus: SeatoolStatus,
    authorizedStatuses: SeatoolStatus[]
  ) => authorizedStatuses.includes(seatoolStatus),
};

export type ActionRule = {
  action: Action;
  check: (
    data: OsMainSourceItem,
    user: CognitoUserAttributes,
    latestRai: LatestRai | null,
    /** Keep excess parameters to a minimum **/
    ...any: any[]
  ) => boolean;
};
