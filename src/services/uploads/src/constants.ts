/**
 * Exposes the constants used throughout the program.
 *
 * The following variables have to be set:
 *
 * CLAMAV_BUCKET_NAME: Name of the bucket where ClamAV and its definitions are stored
 * PATH_TO_AV_DEFINITIONS: Path in S3 where the definitions are stored.
 *
 * The following variables can be overridden:
 *
 * STATUS_CLEAN_FILE: (default 'CLEAN') Tag that will be added to files that are clean.
 * STATUS_INFECTED_FILE: (default 'INFECTED') Tag that will be added to files that are infected.
 * STATUS_ERROR_PROCESSING_FILE: (default 'ERROR') Tag that will be added to files where the scan was not successful.
 * VIRUS_SCAN_STATUS_KEY: (default 'virusScanStatus') Name of the tag that indicates the status of the virus scan.
 * VIRUS_SCAN_TIMESTAMP_KEY: (default 'virusScanTimestamp') Name of the tag that indicates the time of the virus scan.
 */

import process from "process";

// Various paths and application names on S3
export const ATTACHMENTS_BUCKET: string | undefined =
  process.env.ATTACHMENTS_BUCKET;
export const CLAMAV_BUCKET_NAME: string | undefined =
  process.env.CLAMAV_BUCKET_NAME;
export const PATH_TO_AV_DEFINITIONS: string | undefined =
  process.env.PATH_TO_AV_DEFINITIONS;
export const PATH_TO_FRESHCLAM: string = "/opt/bin/freshclam";
export const PATH_TO_CLAMAV: string = "/opt/bin/clamscan";
export const FRESHCLAM_CONFIG: string = "/opt/bin/freshclam.conf";
export const FRESHCLAM_WORK_DIR: string = "/tmp/";
export const TMP_DOWNLOAD_PATH: string = "/tmp/download/";

// Constants for tagging file after a virus scan.
export const STATUS_CLEAN_FILE: string =
  process.env.STATUS_CLEAN_FILE || "CLEAN";
export const STATUS_INFECTED_FILE: string =
  process.env.STATUS_INFECTED_FILE || "INFECTED";
export const STATUS_ERROR_PROCESSING_FILE: string =
  process.env.STATUS_ERROR_PROCESSING_FILE || "ERROR";
export const STATUS_SKIPPED_FILE: string =
  process.env.STATUS_SKIPPED_FILE || "SKIPPED";
export const VIRUS_SCAN_STATUS_KEY: string =
  process.env.VIRUS_SCAN_STATUS_KEY || "virusScanStatus";
export const VIRUS_SCAN_TIMESTAMP_KEY: string =
  process.env.VIRUS_SCAN_TIMESTAMP_KEY || "virusScanTimestamp";
export const MAX_FILE_SIZE: string = process.env.MAX_FILE_SIZE || "314572800";
