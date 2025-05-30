import { Action, ActionType, Authority, FullUser, opensearch, SEATOOL_STATUS } from "shared-types";

const checkAuthority = (authority: Authority | string | null, validAuthorities: string[]) =>
  !authority ? false : validAuthorities.includes(authority.toLowerCase());

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
  // appkParentId,
  // appkParent,
  initialIntakeNeeded,
  submissionDate,
  leadAnalystName,
  locked,
}: opensearch.main.Document) => {
  const secondClockStatuses = [
    SEATOOL_STATUS.PENDING,
    SEATOOL_STATUS.PENDING_APPROVAL,
    SEATOOL_STATUS.PENDING_CONCURRENCE,
  ];

  const planChecks = {
    isSpa: checkAuthority(authority, [Authority.MED_SPA, Authority.CHIP_SPA]),
    isWaiver: checkAuthority(authority, [Authority["1915b"], Authority["1915c"]]),
    isAppk: false,
    isAppkChild: false,
    /** Keep excess methods to a minimum with `is` **/
    authorityIs: (validAuthorities: string[]) => checkAuthority(authority, validAuthorities),
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
      !planChecks.authorityIs([Authority.CHIP_SPA]) &&
      checkStatus(seatoolStatus, secondClockStatuses) &&
      !!raiRequestedDate &&
      !!raiReceivedDate,
    /** Is in any status except Package Withdrawn **/
    isNotWithdrawn: !checkStatus(seatoolStatus, SEATOOL_STATUS.WITHDRAWN),
    /** Added for elasticity, but common checks should always bubble up as
     * object attributes! **/
    hasStatus: (authorizedStatuses: string | string[]) =>
      checkStatus(seatoolStatus, authorizedStatuses),
    /** Is Placeholder Status is a check that is used to determine if the record is in one of the in between status while waiting on seatool intake */
    isPlaceholderStatus: [
      SEATOOL_STATUS.RAI_RESPONSE_WITHDRAW_REQUESTED,
      SEATOOL_STATUS.SUBMITTED,
      SEATOOL_STATUS.WITHDRAW_REQUESTED,
    ].includes(seatoolStatus),
    /** If submission date exists */
    hasSubmissionDate: submissionDate !== undefined,
    isLocked: locked,
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
    hasRaiResponse: !!raiRequestedDate && !!raiReceivedDate && !raiWithdrawnDate,
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

export type ActionRule = {
  action: Action;
  check: (
    checker: IPackageCheck,
    user: FullUser,
    /** Keep excess parameters to a minimum **/
    ...any: any[]
  ) => boolean;
};
