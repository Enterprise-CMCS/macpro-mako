import { opensearch, PlanType, SEATOOL_STATUS } from "../shared-types";

const secondClockStatuses = [
  SEATOOL_STATUS.PENDING,
  SEATOOL_STATUS.PENDING_APPROVAL,
  SEATOOL_STATUS.PENDING_CONCURRENCE,
];

const checkPlan = (planType: PlanType | null, validPlanTypes: PlanType[]) =>
  !planType
    ? false
    : validPlanTypes.includes(planType.toLowerCase() as PlanType);

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
  planType,
}: opensearch.main.Document) => {
  const planChecks = {
    isSpa: checkPlan(planType, [PlanType.MED_SPA, PlanType.CHIP_SPA]),
    isWaiver: checkPlan(planType, []),
    /** Keep excess methods to a minimum with `is` **/
    planTypeIs: (validPlanTypes: PlanType[]) =>
      checkPlan(planType, validPlanTypes),
  };
  const statusChecks = {
    /** Is in any of our pending statuses, sans Pending-RAI **/
    isInActivePendingStatus: checkStatus(seatoolStatus, [
      ...secondClockStatuses,
      SEATOOL_STATUS.PENDING_OFF_THE_CLOCK,
    ]),
    /** Is in a second clock status and RAI has been received **/
    isInSecondClock:
      !planChecks.planTypeIs([PlanType.CHIP_SPA]) &&
      checkStatus(seatoolStatus, secondClockStatuses) &&
      raiRequestedDate && raiReceivedDate && !raiWithdrawnDate,
    /** Is in any status except Package Withdrawn **/
    isNotWithdrawn: !checkStatus(seatoolStatus, SEATOOL_STATUS.WITHDRAWN),
    /** Added for elasticity, but common checks should always bubble up as
     * object attributes! **/
    hasStatus: (authorizedStatuses: string | string[]) =>
      checkStatus(seatoolStatus, authorizedStatuses),
  };
  const raiChecks = {
    /** Latest RAI is requested and status is Pending-RAI **/
    hasRequestedRai: !!raiRequestedDate && !raiReceivedDate && !raiWithdrawnDate,
    /** Latest RAI is not null **/
    hasLatestRai: !!raiRequestedDate,
    /** Latest RAI has been responded to **/
    hasRaiResponse: !!raiRequestedDate && !!raiReceivedDate && !raiWithdrawnDate,
    /** Latest RAI has a response and/or has been withdrawn **/
    hasCompletedRai: !!raiRequestedDate && (!!raiReceivedDate || !!raiWithdrawnDate),
    /** RAI Withdraw has been enabled **/
    hasEnabledRaiWithdraw: raiWithdrawEnabled,
  };
  return {
    ...planChecks,
    ...statusChecks,
    ...raiChecks,
  };
};

export type IPackageCheck = ReturnType<typeof PackageCheck>;
