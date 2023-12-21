import { OsMainSourceItem } from "./opensearch";
import { CognitoUserAttributes } from "./user";
import { getLatestRai } from "shared-utils";
import { SEATOOL_STATUS } from "./statusHelper";

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

const checkStatus = (seatoolStatus: string, authorized: string | string[]) =>
  typeof authorized === "string"
    ? seatoolStatus === authorized
    : authorized.includes(seatoolStatus);

export const ActionAvailabilityCheck = ({
  seatoolStatus,
  rais,
  raiWithdrawEnabled,
}: OsMainSourceItem) => {
  const latestRai = getLatestRai(rais);
  return {
    isInRaiStatus: checkStatus(seatoolStatus, raiStatuses),
    hasRequestedRai:
      latestRai?.status === "requested" &&
      checkStatus(seatoolStatus, SEATOOL_STATUS.PENDING_RAI),
    hasLatestRai: latestRai !== null,
    hasRaiResponse: latestRai?.status === "received",
    hasEnabledRaiWithdraw: raiWithdrawEnabled,
    isNotWithdrawn: !checkStatus(seatoolStatus, SEATOOL_STATUS.WITHDRAWN),
    /** Adding for elasticity, but common checks should always bubble up as
     * object attributes! **/
    hasStatus: (authorizedStatuses: string | string[]) =>
      checkStatus(seatoolStatus, authorizedStatuses),
  };
};

export type ActionRule = {
  action: Action;
  check: (
    checker: ReturnType<typeof ActionAvailabilityCheck>,
    user: CognitoUserAttributes,
    /** Keep excess parameters to a minimum **/
    ...any: any[]
  ) => boolean;
};
