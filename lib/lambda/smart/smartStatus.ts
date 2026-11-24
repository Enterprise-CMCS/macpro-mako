import { SEATOOL_STATUS } from "shared-types";

export const SMART_STATUS_VALUES = [
  "Intake Needed",
  "Pending - First Clock",
  "Pending RAI",
  "Pending - Second Clock",
  "Pending Concurrence",
  "Pending Approval",
  "Pending Disapproval",
  "Approved",
  "Disapproved",
  "Withdrawn",
] as const;

export type SmartStatus = (typeof SMART_STATUS_VALUES)[number];

export const CHIP_SMART_STATUS_VALUES = [
  ...SMART_STATUS_VALUES,
  "Pending - Concurrence",
  "Pending - Approval",
  "Pending - Disapproval",
] as const;

export type ChipSmartStatus = (typeof CHIP_SMART_STATUS_VALUES)[number];

export interface SmartStatusMapping {
  seatoolStatus: string;
  /** Explicit clock state. Undefined preserves the legacy date-derived behavior. */
  secondClock?: boolean;
}

// CHIP uses the shared MSP event contract, but keeps an explicit crosswalk so
// its lifecycle can be reviewed independently of Medicaid's display names.
const CHIP_STATUS_CROSSWALK: Record<ChipSmartStatus, SmartStatusMapping> = {
  "Intake Needed": { seatoolStatus: SEATOOL_STATUS.SUBMITTED, secondClock: false },
  "Pending - First Clock": { seatoolStatus: SEATOOL_STATUS.PENDING, secondClock: false },
  "Pending RAI": { seatoolStatus: SEATOOL_STATUS.PENDING_RAI, secondClock: false },
  "Pending - Second Clock": { seatoolStatus: SEATOOL_STATUS.PENDING, secondClock: true },
  "Pending Concurrence": { seatoolStatus: SEATOOL_STATUS.PENDING_CONCURRENCE },
  "Pending - Concurrence": { seatoolStatus: SEATOOL_STATUS.PENDING_CONCURRENCE },
  "Pending Approval": { seatoolStatus: SEATOOL_STATUS.PENDING_APPROVAL },
  "Pending - Approval": { seatoolStatus: SEATOOL_STATUS.PENDING_APPROVAL },
  "Pending Disapproval": { seatoolStatus: SEATOOL_STATUS.PENDING_DISAPPROVAL },
  "Pending - Disapproval": { seatoolStatus: SEATOOL_STATUS.PENDING_DISAPPROVAL },
  Approved: { seatoolStatus: SEATOOL_STATUS.APPROVED, secondClock: false },
  Disapproved: { seatoolStatus: SEATOOL_STATUS.DISAPPROVED, secondClock: false },
  Withdrawn: { seatoolStatus: SEATOOL_STATUS.WITHDRAWN, secondClock: false },
};

/**
 * Maps the confirmed SMART status contract to OneMAC's established internal statuses.
 * MSP_MANUAL_RECORD_CREATED does not use Kafka `status` for seatool mapping.
 */
export const mapSmartStatus = (
  smartStatus: string,
  authority: "Medicaid SPA" | "CHIP SPA" = "Medicaid SPA",
): SmartStatusMapping | undefined => {
  if (authority === "CHIP SPA") {
    return Object.hasOwn(CHIP_STATUS_CROSSWALK, smartStatus)
      ? CHIP_STATUS_CROSSWALK[smartStatus as ChipSmartStatus]
      : undefined;
  }

  switch (smartStatus) {
    case "Intake Needed":
      return { seatoolStatus: SEATOOL_STATUS.SUBMITTED, secondClock: false };
    case "Pending - First Clock":
      return { seatoolStatus: SEATOOL_STATUS.PENDING, secondClock: false };
    case "Pending RAI":
      return { seatoolStatus: SEATOOL_STATUS.PENDING_RAI, secondClock: false };
    case "Pending - Second Clock":
      return { seatoolStatus: SEATOOL_STATUS.PENDING, secondClock: true };
    case "Pending Concurrence":
      return { seatoolStatus: SEATOOL_STATUS.PENDING_CONCURRENCE };
    case "Pending Approval":
      return { seatoolStatus: SEATOOL_STATUS.PENDING_APPROVAL };
    case "Pending Disapproval":
      return { seatoolStatus: SEATOOL_STATUS.PENDING_DISAPPROVAL };
    case "Approved":
      return { seatoolStatus: SEATOOL_STATUS.APPROVED, secondClock: false };
    case "Disapproved":
      return { seatoolStatus: SEATOOL_STATUS.DISAPPROVED, secondClock: false };
    case "Withdrawn":
      return { seatoolStatus: SEATOOL_STATUS.WITHDRAWN, secondClock: false };
    default:
      return undefined;
  }
};

export const mapSmartStatusToSeatoolStatus = (smartStatus: string): string | undefined =>
  mapSmartStatus(smartStatus)?.seatoolStatus;
