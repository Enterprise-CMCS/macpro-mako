export const VIRUS_SCAN_STATUS_TAG_KEY = "virusScanStatus";
export const CLEAN_VIRUS_SCAN_STATUS = "CLEAN";

export function isNonCleanVirusScanStatus(virusScanStatus?: string): boolean {
  return !!virusScanStatus && virusScanStatus.toUpperCase() !== CLEAN_VIRUS_SCAN_STATUS;
}
