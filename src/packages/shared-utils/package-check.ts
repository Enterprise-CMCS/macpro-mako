import {
  opensearch,
  SEATOOL_STATUS,
  ActionType,
  Authority,
  SeatoolAuthority,
} from "shared-types";

const secondClockStatuses = [
  SEATOOL_STATUS.PENDING,
  SEATOOL_STATUS.PENDING_APPROVAL,
  SEATOOL_STATUS.PENDING_CONCURRENCE,
];

const checkAuthority = (authority: string, validAuthorities: Authority[]) =>
  validAuthorities.some((validAuthority) => validAuthority === authority);

const checkStatus = (seatoolStatus: string, authorized: string | string[]) =>
  typeof authorized === "string"
    ? seatoolStatus === authorized
    : authorized.includes(seatoolStatus);

/** A object of booleans and methods handling common conditions
 * for business logic. */
export const PackageCheck = ({
  seatoolStatus,
  raiRequestedDate,
  raiReceivedDate,
  raiWithdrawnDate,
  raiWithdrawEnabled,
  authority,
  actionType,
  appkParentId,
  appkParent,
  initialIntakeNeeded,
  leadAnalystName,
}: opensearch.main.Document) => {
  const planChecks = {
    isSpa: checkAuthority(authority, ["Medicaid SPA", "CHIP SPA"]),
    isWaiver: checkAuthority(authority, ["1915(b)", "1915(c)"]),
    isAppk: appkParent,
    isAppkChild: appkParentId,
    /** Keep excess methods to a minimum with `is` **/
    authorityIs: (validAuthorities: Authority[]) =>
      checkAuthority(authority, validAuthorities),
    hasCpoc: !!leadAnalystName,
  };
  const statusChecks = {
    /** Is in any of our pending statuses, sans Pending-RAI **/
    isInActivePendingStatus: checkStatus(seatoolStatus, [
      ...secondClockStatuses,
      SEATOOL_STATUS.PENDING_OFF_THE_CLOCK,
    ]),
    /** Is in a second clock status and RAI has been received **/
    isInSecondClock:
      !planChecks.authorityIs(["CHIP SPA"]) &&
      checkStatus(seatoolStatus, secondClockStatuses) &&
      raiRequestedDate &&
      raiReceivedDate &&
      !raiWithdrawnDate,
    /** Is in any status except Package Withdrawn **/
    isNotWithdrawn: !checkStatus(seatoolStatus, SEATOOL_STATUS.WITHDRAWN),
    /** Added for elasticity, but common checks should always bubble up as
     * object attributes! **/
    hasStatus: (authorizedStatuses: string | string[]) =>
      checkStatus(seatoolStatus, authorizedStatuses),
  };
  const subStatusChecks = {
    /** Is in any of our pending statuses, sans Pending-RAI **/
    needsIntake: initialIntakeNeeded,
  };
  const raiChecks = {
    /** There is an RAI and it does not have a response **/
    hasRequestedRai: !!raiRequestedDate && !raiReceivedDate,
    /** There is an RAI **/
    hasLatestRai: !!raiRequestedDate,
    /** There is an RAI, it has a response, and it has not been withdrawn **/
    hasRaiResponse:
      !!raiRequestedDate && !!raiReceivedDate && !raiWithdrawnDate,
    /** Latest RAI has a response and/or has been withdrawn **/
    hasCompletedRai: !!raiRequestedDate && !!raiReceivedDate,
    /** Latest RAI has a response and/or has been withdrawn **/
    hasRaiWithdrawal: !!raiWithdrawnDate,
    /** RAI Withdraw has been enabled **/
    hasEnabledRaiWithdraw: raiWithdrawEnabled,
  };

  const actionTypeChecks = {
    isInitialOrRenewal: actionType === "New" || actionType === "Renew",
    isTempExtension: actionType === "Extend",
    actionIs: (action: ActionType) => actionType === action,
  };

  return {
    ...planChecks,
    ...statusChecks,
    ...subStatusChecks,
    ...raiChecks,
    ...actionTypeChecks,
  };
};

export type IPackageCheck = ReturnType<typeof PackageCheck>;
