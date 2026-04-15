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

export interface AttachmentArchiveIntegrityRunSummary {
  runId: string;
  stage: string;
  runTimestamp: string;
  status: "SUCCESS" | "FAILED";
  packagesScanned: number;
  sectionsScanned: number;
  discrepancyCount: number;
  discrepancyTypeCounts: Record<string, number>;
  topDiscrepancyTypes: Array<{
    type: string;
    count: number;
  }>;
  reportBucketName: string;
  reportPrefix: string;
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

export interface AttachmentArchiveIntegrityRunResult {
  runId: string;
  stage: string;
  runTimestamp: string;
  reportBucketName: string;
  summaryKey: string;
  discrepancyCsvKey: string;
  discrepancyCsvFilename: string;
  discrepancyCsvTruncated: boolean;
  discrepancyCsvRowsIncluded: number;
  discrepancyCsvRowsTotal: number;
  discrepancyCount: number;
  discrepancyTypeCounts: Record<string, number>;
  packagesScanned: number;
  sectionsScanned: number;
}
