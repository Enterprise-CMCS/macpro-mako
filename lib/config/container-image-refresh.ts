/**
 * Bump these values when you need CDK to rebuild a container image even if the
 * application source or direct dependencies have not changed.
 */
export const containerImageRefresh = {
  attachmentArchiveWorker: "2026-05-13-attachment-archive-security-refresh",
  clamAvScanning: "2026-05-13-clamav-al2023-security-refresh",
} as const;
