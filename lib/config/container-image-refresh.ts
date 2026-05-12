/**
 * Bump these values when you need CDK to rebuild a container image even if the
 * application source or direct dependencies have not changed.
 */
export const containerImageRefresh = {
  attachmentArchiveWorker: "2026-05-08-attachment-archive-base-refresh",
  clamAvScanning: "2026-05-08-clamav-al2023-refresh",
} as const;
