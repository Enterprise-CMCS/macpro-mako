export const ATTACHMENT_ARCHIVE_SCOPES = ["all", "section"] as const;
export type AttachmentArchiveScope = (typeof ATTACHMENT_ARCHIVE_SCOPES)[number];

export const ATTACHMENT_ARCHIVE_STATUSES = ["PENDING", "RUNNING", "READY", "FAILED"] as const;
export type AttachmentArchiveStatus = (typeof ATTACHMENT_ARCHIVE_STATUSES)[number];

export const ATTACHMENT_ARCHIVE_FAILURE_CODES = [
  "ALL_ATTACHMENTS_UNAVAILABLE",
  "ATTACHMENT_NOT_CLEAN",
] as const;
export type AttachmentArchiveFailureCode = (typeof ATTACHMENT_ARCHIVE_FAILURE_CODES)[number];
export const ATTACHMENT_ARCHIVE_BUILD_VERSION = 2;

export interface AttachmentArchiveSourceAttachment {
  bucket: string;
  key: string;
  filename: string;
  title: string;
  uploadDate?: number;
}

export interface AttachmentArchiveManifestAttachment extends AttachmentArchiveSourceAttachment {
  archiveFilename: string;
  archivePath: string;
}

export interface AttachmentArchiveSectionInfo {
  sectionId: string;
  sectionNumber: number;
  sectionLabel: string;
  sectionFolderName: string;
  rootFolderName: string;
}

export interface AttachmentArchiveSectionRequest extends AttachmentArchiveSectionInfo {
  packageId: string;
  scope: "section";
  attachments: AttachmentArchiveSourceAttachment[];
}

export interface AttachmentArchiveSectionManifest extends AttachmentArchiveSectionInfo {
  version: 2;
  buildVersion: number;
  type: "section";
  packageId: string;
  scope: "section";
  hash: string;
  createdAt: string;
  attachments: AttachmentArchiveManifestAttachment[];
}

export interface AttachmentArchivePackageManifestSection extends AttachmentArchiveSectionInfo {
  artifactKey: string;
  attachmentCount: number;
  hash: string;
  manifestKey: string;
}

export interface AttachmentArchivePackageManifest {
  version: 2;
  buildVersion: number;
  type: "package";
  packageId: string;
  scope: "all";
  hash: string;
  createdAt: string;
  rootFolderName: string;
  sections: AttachmentArchivePackageManifestSection[];
}

export type AttachmentArchiveManifest =
  | AttachmentArchiveSectionManifest
  | AttachmentArchivePackageManifest;

export interface AttachmentArchiveBlockedAttachment {
  bucket: string;
  key: string;
  filename: string;
  title: string;
  virusScanStatus?: string;
}

export interface AttachmentArchiveCurrent {
  version: 2;
  scope: AttachmentArchiveScope;
  hash: string;
  status: AttachmentArchiveStatus;
  artifactKey: string;
  manifestKey: string;
  attachmentCount: number;
  appendedAttachmentCount?: number;
  skippedAttachmentCount?: number;
  updatedAt: string;
  executionArn?: string;
  sectionId?: string;
  sectionNumber?: number;
  sectionLabel?: string;
  sectionFolderName?: string;
  failureCode?: AttachmentArchiveFailureCode;
  failureMessage?: string;
  blockedAttachment?: AttachmentArchiveBlockedAttachment;
  errorMessage?: string;
}

export interface AttachmentArchiveStateMachineInput {
  archiveBucketName: string;
  artifactKey: string;
  attachmentCount: number;
  currentKey: string;
  hash: string;
  manifestKey: string;
}

export interface AttachmentArchiveRebuildMessage {
  packageId: string;
  latestTimestamp?: number;
  preferDraft?: boolean;
  source: "request" | "sink-changelog" | "backfill";
}
