import { SEATOOL_STATUS } from "shared-types";

export const SMART_STATUS_VALUES = [
  "Intake Needed",
  "Pkg Received",
  "Package Received",
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

export interface SmartStatusMapping {
  seatoolStatus: string;
  /** Explicit clock state. Undefined preserves the legacy date-derived behavior. */
  secondClock?: boolean;
}

/**
 * Maps the provisional SMART status contract to OneMAC's established internal statuses.
 * MSP_MANUAL_RECORD_CREATED does not use Kafka `status` for seatool mapping.
 */
export const mapSmartStatus = (smartStatus: string): SmartStatusMapping | undefined => {
  switch (smartStatus) {
    case "Intake Needed":
    case "Pkg Received":
    case "Package Received":
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
