import path from "path";

export interface AttachmentScanTag {
  Key: string;
  Value: string;
}

export interface ScannerRedriveTarget {
  bucket: string;
  key: string;
}

export interface ManualRetagEligibilityInput {
  attemptedRedrive: boolean;
  bucket: string;
  exists: boolean;
  filename: string;
  virusScanStatus?: string;
}

const VIRUS_SCAN_STATUS_KEY = "virusScanStatus";
const VIRUS_SCAN_TIMESTAMP_KEY = "virusScanTimestamp";
const CLEAN_STATUS = "CLEAN";

// Keep this aligned with the ClamAV scanner allowlist in
// lib/local-constructs/clamav-scanning/src/lib/file-ext.ts without importing
// that package into operational repair tooling.
const ALLOWED_EXTENSIONS = new Set([
  ".bmp",
  ".csv",
  ".doc",
  ".docx",
  ".gif",
  ".jpeg",
  ".odp",
  ".ods",
  ".odt",
  ".pdf",
  ".png",
  ".ppt",
  ".pptx",
  ".rtf",
  ".tif",
  ".txt",
  ".xls",
  ".xlsx",
]);

export function buildSyntheticScannerInvokePayload(target: ScannerRedriveTarget) {
  return {
    Records: [
      {
        body: JSON.stringify({
          Records: [
            {
              s3: {
                bucket: { name: target.bucket },
                object: { key: target.key },
              },
            },
          ],
        }),
      },
    ],
  };
}

export function upsertScanTags({
  existingTags,
  status,
  timestamp,
}: {
  existingTags: AttachmentScanTag[];
  status: string;
  timestamp: string;
}) {
  const preserved = existingTags.filter(
    (tag) => tag.Key !== VIRUS_SCAN_STATUS_KEY && tag.Key !== VIRUS_SCAN_TIMESTAMP_KEY,
  );

  return [
    ...preserved,
    { Key: VIRUS_SCAN_STATUS_KEY, Value: status },
    { Key: VIRUS_SCAN_TIMESTAMP_KEY, Value: timestamp },
  ];
}

export function isManualCleanRetagEligible({
  attemptedRedrive,
  bucket,
  exists,
  filename,
  virusScanStatus,
}: ManualRetagEligibilityInput) {
  if (!attemptedRedrive || !exists || !virusScanStatus || virusScanStatus === CLEAN_STATUS) {
    return false;
  }

  const extension = path.extname(filename).toLowerCase();
  if (!ALLOWED_EXTENSIONS.has(extension)) {
    return false;
  }

  return bucket.startsWith("mako-main-attachments-");
}
