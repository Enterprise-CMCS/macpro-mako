import { OsMainSourceItem, PlanType, SEATOOL_STATUS } from "../shared-types";
import { getLatestRai } from "./rai-helper";

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
  rais,
  raiWithdrawEnabled,
  planType,
}: OsMainSourceItem) => {
  const latestRai = getLatestRai(rais);
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
      latestRai?.status === "received",
    /** Is in any status except Package Withdrawn **/
    isNotWithdrawn: !checkStatus(seatoolStatus, SEATOOL_STATUS.WITHDRAWN),
    /** Added for elasticity, but common checks should always bubble up as
     * object attributes! **/
    hasStatus: (authorizedStatuses: string | string[]) =>
      checkStatus(seatoolStatus, authorizedStatuses),
  };
  const raiChecks = {
    /** Latest RAI is requested and status is Pending-RAI **/
    hasRequestedRai: latestRai?.status === "requested",
    /** Latest RAI is not null **/
    hasLatestRai: latestRai !== null,
    /** Latest RAI has been responded to **/
    hasRaiResponse: latestRai?.status === "received",
    /** RAI Withdraw has been enabled **/
    hasEnabledRaiWithdraw: latestRai?.status === "requested" || raiWithdrawEnabled,
  };
  return {
    ...planChecks,
    ...statusChecks,
    ...raiChecks,
  };
};

export type IPackageCheck = ReturnType<typeof PackageCheck>;
