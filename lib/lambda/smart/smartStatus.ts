import { SEATOOL_STATUS } from "shared-types";

/**
 * Maps Confluence SMART status strings to SEATOOL_STATUS for future event handlers.
 * MSP_MANUAL_RECORD_CREATED does not use Kafka `status` for seatool mapping.
 */
export const mapSmartStatusToSeatoolStatus = (smartStatus: string): string | undefined => {
  switch (smartStatus) {
    case "Intake Needed":
    case "Pkg Received":
    case "Package Received":
      return SEATOOL_STATUS.SUBMITTED;
    case "Pending - First Clock":
      return SEATOOL_STATUS.PENDING;
    case "Approved":
      return SEATOOL_STATUS.APPROVED;
    default:
      return undefined;
  }
};
