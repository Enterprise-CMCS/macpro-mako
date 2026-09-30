export const SMART_RECORD_TYPE = {
  RESERVATION: "RESERVATION",
  PACKAGE: "PACKAGE",
} as const;

export type SmartRecordType = (typeof SMART_RECORD_TYPE)[keyof typeof SMART_RECORD_TYPE];
