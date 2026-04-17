export interface AttachmentArchiveIntegrityDiscrepancy {
  authority: string;
  packageId: string;
  sectionId: string;
  cmsStatus: string;
  submissionDate: string;
  issueScope: "Download All" | "Section";
  discrepancyType: string;
  expectedValue: string;
  actualValue: string;
}

export type AttachmentArchiveIntegrityNotificationStatus =
  | "SKIPPED"
  | "PENDING"
  | "SENT"
  | "FAILED";

export type AttachmentArchiveIntegrityRunSummaryStatus = "RUNNING" | "SUCCESS" | "FAILED";

export interface AttachmentArchiveIntegrityRunSummary {
  runId: string;
  stage: string;
  runTimestamp: string;
  status: AttachmentArchiveIntegrityRunSummaryStatus;
  packagesScanned: number;
  packagesTotal: number;
  sectionsScanned: number;
  discrepancyCount: number;
  discrepancyTypeCounts: Record<string, number>;
  topDiscrepancyTypes: Array<{
    type: string;
    count: number;
  }>;
  reportBucketName: string;
  reportPrefix: string;
  checkpointKey: string;
  lastProcessedPackageId?: string;
  discrepancyJsonKey: string;
  discrepancyCsvKey: string;
  discrepancyCsvFilename: string;
  discrepancyCsvTruncated: boolean;
  discrepancyCsvRowsIncluded: number;
  discrepancyCsvRowsTotal: number;
  notificationStatus: AttachmentArchiveIntegrityNotificationStatus;
  notificationError?: string;
  notificationSentAt?: string;
  errorMessage?: string;
}

export interface AttachmentArchiveIntegrityCheckpoint {
  runId: string;
  runTimestamp: string;
  stage: string;
  packageIdsKey: string;
  nextPackageIndex: number;
  packagesScanned: number;
  packagesTotal: number;
  sectionsScanned: number;
  discrepancyCount: number;
  discrepancyTypeCounts: Record<string, number>;
  lastProcessedPackageId?: string;
  chunkCount: number;
}

interface AttachmentArchiveIntegrityRunBaseResult {
  runId: string;
  stage: string;
  runTimestamp: string;
  reportBucketName: string;
  summaryKey: string;
  checkpointKey: string;
  packagesTotal: number;
  lastProcessedPackageId?: string;
  discrepancyCount: number;
  discrepancyTypeCounts: Record<string, number>;
  packagesScanned: number;
  sectionsScanned: number;
}

export interface AttachmentArchiveIntegrityRunInProgressResult
  extends AttachmentArchiveIntegrityRunBaseResult {
  status: "IN_PROGRESS";
}

export interface AttachmentArchiveIntegrityRunCompleteResult
  extends AttachmentArchiveIntegrityRunBaseResult {
  status: "COMPLETE";
  discrepancyCsvKey: string;
  discrepancyCsvFilename: string;
  discrepancyCsvTruncated: boolean;
  discrepancyCsvRowsIncluded: number;
  discrepancyCsvRowsTotal: number;
}

export type AttachmentArchiveIntegrityRunResult =
  | AttachmentArchiveIntegrityRunInProgressResult
  | AttachmentArchiveIntegrityRunCompleteResult;
