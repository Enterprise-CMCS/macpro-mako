import { SMART_RECORD_TYPE } from "shared-types";

interface SmartRecordClassification {
  origin?: string | null;
  smartRecordType?: string | null;
}

/**
 * SMART records created before classification existed remain hidden by default.
 * Only completed SMART packages are eligible for normal OneMAC reads and actions.
 */
export const isHiddenSmartReservation = (
  record: SmartRecordClassification | null | undefined,
): boolean => record?.origin === "SMART" && record.smartRecordType !== SMART_RECORD_TYPE.PACKAGE;
