import { createHash } from "crypto";
import { z } from "zod";

import {
  ATTACHMENT_ARCHIVE_FAILURE_CODES,
  ATTACHMENT_ARCHIVE_SCOPES,
  ATTACHMENT_ARCHIVE_STATUSES,
  ATTACHMENT_ARCHIVE_BUILD_VERSION,
  AttachmentArchiveBlockedAttachment,
  AttachmentArchiveCurrent,
  AttachmentArchiveFailureCode,
  AttachmentArchivePackageManifest,
  AttachmentArchivePackageManifestSection,
  AttachmentArchiveScope,
  AttachmentArchiveSectionManifest,
  AttachmentArchiveSectionRequest,
  AttachmentArchiveSourceAttachment,
  AttachmentArchiveStatus,
} from "./types";

function compareStrings(left: string, right: string): number {
  return left.localeCompare(right);
}

function buildArchiveEntryFilename(filename: string, index: number): string {
  const lastDot = filename.lastIndexOf(".");

  if (lastDot <= 0) {
    return `${filename} (${index})`;
  }

  const basename = filename.slice(0, lastDot);
  const extension = filename.slice(lastDot);
  return `${basename} (${index})${extension}`;
}

function getUniqueArchiveEntryFilenames(filenames: string[]): string[] {
  const usedNames = new Set<string>();

  return filenames.map((filename) => {
    if (!usedNames.has(filename)) {
      usedNames.add(filename);
      return filename;
    }

    let duplicateIndex = 2;
    let candidate = buildArchiveEntryFilename(filename, duplicateIndex);

    while (usedNames.has(candidate)) {
      duplicateIndex += 1;
      candidate = buildArchiveEntryFilename(filename, duplicateIndex);
    }

    usedNames.add(candidate);
    return candidate;
  });
}

function sanitizeDownloadComponent(value: string): string {
  return value.replace(/[^A-Za-z0-9._-]+/g, "_");
}

function formatEasternDownloadDate(now = new Date()): string {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/New_York",
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  }).formatToParts(now);

  const getPart = (type: string) => parts.find((part) => part.type === type)?.value;

  return [getPart("weekday"), getPart("month"), getPart("day"), getPart("year")]
    .filter((value): value is string => Boolean(value))
    .join(" ");
}

function sortAttachments(attachments: AttachmentArchiveSourceAttachment[]) {
  return [...attachments]
    .map((attachment) => ({
      bucket: attachment.bucket,
      key: attachment.key,
      filename: attachment.filename,
      title: attachment.title,
      uploadDate: attachment.uploadDate,
    }))
    .sort((left, right) => {
      return (
        compareStrings(left.filename, right.filename) ||
        compareStrings(left.key, right.key) ||
        compareStrings(left.bucket, right.bucket) ||
        compareStrings(left.title, right.title) ||
        (left.uploadDate || 0) - (right.uploadDate || 0)
      );
    });
}

export function normalizeArchivePathComponent(value: string): string {
  return encodeURIComponent(value);
}

export function buildSectionArchiveFolderName({
  sectionNumber,
  sectionLabel,
}: {
  sectionNumber: number;
  sectionLabel: string;
}): string {
  return `section-${sectionNumber}-${sectionLabel}`;
}

export function getPackageArchiveRootFolderName(packageId: string): string {
  return `${sanitizeDownloadComponent(packageId)}-attachments`;
}

export function getSectionArchiveRootFolderName({
  packageId,
  sectionNumber,
  sectionLabel,
}: {
  packageId: string;
  sectionNumber: number;
  sectionLabel: string;
}): string {
  return `${sanitizeDownloadComponent(packageId)}-${buildSectionArchiveFolderName({
    sectionNumber,
    sectionLabel,
  })}`;
}

export function getArchiveBasePrefix({
  packageId,
  scope,
  sectionId,
}: {
  packageId: string;
  scope: AttachmentArchiveScope;
  sectionId?: string;
}): string {
  const normalizedPackageId = normalizeArchivePathComponent(packageId);

  if (scope === "all") {
    return `package/${normalizedPackageId}/all`;
  }

  if (!sectionId) {
    throw new Error("sectionId is required for section-scoped archives");
  }

  return `package/${normalizedPackageId}/section/${normalizeArchivePathComponent(sectionId)}`;
}

export function getArchiveCurrentKey(request: {
  packageId: string;
  scope: AttachmentArchiveScope;
  sectionId?: string;
}): string {
  return `${getArchiveBasePrefix(request)}/current.json`;
}

export function getArchiveManifestKey(
  request: {
    packageId: string;
    scope: AttachmentArchiveScope;
    sectionId?: string;
  },
  hash: string,
): string {
  return `${getArchiveBasePrefix(request)}/${hash}.manifest.json`;
}

export function getArchiveArtifactKey(
  request: {
    packageId: string;
    scope: AttachmentArchiveScope;
    sectionId?: string;
  },
  hash: string,
): string {
  return `${getArchiveBasePrefix(request)}/${hash}.zip`;
}

export function getArchiveDownloadFilename(request: {
  packageId: string;
  scope: AttachmentArchiveScope;
  sectionNumber?: number;
  sectionLabel?: string;
  now?: Date;
}): string {
  const packageId = sanitizeDownloadComponent(request.packageId);

  if (request.scope === "all") {
    return `${packageId} - ${formatEasternDownloadDate(request.now)}.zip`;
  }

  const sectionNumber = request.sectionNumber || 1;
  const sectionLabel = sanitizeDownloadComponent(request.sectionLabel || "section");
  return `${packageId}-section-${sectionNumber}-${sectionLabel}-attachments.zip`;
}

export function buildSectionAttachmentArchiveManifest(
  request: AttachmentArchiveSectionRequest,
): AttachmentArchiveSectionManifest {
  const sortedAttachments = sortAttachments(request.attachments);
  const archiveFilenames = getUniqueArchiveEntryFilenames(
    sortedAttachments.map((attachment) => attachment.filename),
  );
  const attachments = sortedAttachments.map((attachment, index) => ({
    ...attachment,
    archiveFilename: archiveFilenames[index],
    archivePath: `${request.rootFolderName}/${archiveFilenames[index]}`,
  }));

  const canonicalPayload = JSON.stringify({
    buildVersion: ATTACHMENT_ARCHIVE_BUILD_VERSION,
    packageId: request.packageId,
    scope: request.scope,
    sectionId: request.sectionId,
    sectionNumber: request.sectionNumber,
    sectionLabel: request.sectionLabel,
    sectionFolderName: request.sectionFolderName,
    rootFolderName: request.rootFolderName,
    attachments: attachments.map((attachment) => ({
      archiveFilename: attachment.archiveFilename,
      archivePath: attachment.archivePath,
      bucket: attachment.bucket,
      filename: attachment.filename,
      key: attachment.key,
      title: attachment.title,
      uploadDate: attachment.uploadDate,
    })),
  });

  const hash = createHash("sha256").update(canonicalPayload).digest("hex");

  return {
    version: 2,
    buildVersion: ATTACHMENT_ARCHIVE_BUILD_VERSION,
    type: "section",
    packageId: request.packageId,
    scope: "section",
    sectionId: request.sectionId,
    sectionNumber: request.sectionNumber,
    sectionLabel: request.sectionLabel,
    sectionFolderName: request.sectionFolderName,
    rootFolderName: request.rootFolderName,
    hash,
    createdAt: new Date().toISOString(),
    attachments,
  };
}

export function buildPackageAttachmentArchiveManifest({
  packageId,
  sections,
}: {
  packageId: string;
  sections: AttachmentArchivePackageManifestSection[];
}): AttachmentArchivePackageManifest {
  const rootFolderName = getPackageArchiveRootFolderName(packageId);
  const canonicalSections = sections.map((section) => ({
    sectionId: section.sectionId,
    sectionNumber: section.sectionNumber,
    sectionLabel: section.sectionLabel,
    sectionFolderName: section.sectionFolderName,
    rootFolderName: section.rootFolderName,
    attachmentCount: section.attachmentCount,
    hash: section.hash,
  }));
  const hash = createHash("sha256")
    .update(
      JSON.stringify({
        buildVersion: ATTACHMENT_ARCHIVE_BUILD_VERSION,
        packageId,
        scope: "all",
        rootFolderName,
        sections: canonicalSections,
      }),
    )
    .digest("hex");

  return {
    version: 2,
    buildVersion: ATTACHMENT_ARCHIVE_BUILD_VERSION,
    type: "package",
    packageId,
    scope: "all",
    hash,
    createdAt: new Date().toISOString(),
    rootFolderName,
    sections,
  };
}

export function buildAttachmentArchiveCurrent({
  scope,
  hash,
  status,
  artifactKey,
  manifestKey,
  attachmentCount,
  appendedAttachmentCount,
  skippedAttachmentCount,
  executionArn,
  sectionId,
  sectionNumber,
  sectionLabel,
  sectionFolderName,
  failureCode,
  failureMessage,
  blockedAttachment,
  errorMessage,
}: {
  scope: AttachmentArchiveScope;
  hash: string;
  status: AttachmentArchiveStatus;
  artifactKey: string;
  manifestKey: string;
  attachmentCount: number;
  appendedAttachmentCount?: number;
  skippedAttachmentCount?: number;
  executionArn?: string;
  sectionId?: string;
  sectionNumber?: number;
  sectionLabel?: string;
  sectionFolderName?: string;
  failureCode?: AttachmentArchiveFailureCode;
  failureMessage?: string;
  blockedAttachment?: AttachmentArchiveBlockedAttachment;
  errorMessage?: string;
}): AttachmentArchiveCurrent {
  return {
    version: 2,
    scope,
    hash,
    status,
    artifactKey,
    manifestKey,
    attachmentCount,
    ...(typeof appendedAttachmentCount === "number" ? { appendedAttachmentCount } : {}),
    ...(typeof skippedAttachmentCount === "number" ? { skippedAttachmentCount } : {}),
    updatedAt: new Date().toISOString(),
    ...(executionArn ? { executionArn } : {}),
    ...(sectionId ? { sectionId } : {}),
    ...(sectionNumber ? { sectionNumber } : {}),
    ...(sectionLabel ? { sectionLabel } : {}),
    ...(sectionFolderName ? { sectionFolderName } : {}),
    ...(failureCode ? { failureCode } : {}),
    ...(failureMessage ? { failureMessage } : {}),
    ...(blockedAttachment ? { blockedAttachment } : {}),
    ...(errorMessage || failureMessage ? { errorMessage: errorMessage || failureMessage } : {}),
  };
}

export const AttachmentArchiveBlockedAttachmentSchema = z
  .object({
    bucket: z.string(),
    key: z.string(),
    filename: z.string(),
    title: z.string(),
    virusScanStatus: z.string().optional(),
  })
  .passthrough();

export const AttachmentArchiveCurrentSchema = z
  .object({
    version: z.literal(2),
    scope: z.enum(ATTACHMENT_ARCHIVE_SCOPES),
    hash: z.string(),
    status: z.enum(ATTACHMENT_ARCHIVE_STATUSES),
    artifactKey: z.string(),
    manifestKey: z.string(),
    attachmentCount: z.number(),
    appendedAttachmentCount: z.number().optional(),
    skippedAttachmentCount: z.number().optional(),
    updatedAt: z.string(),
    executionArn: z.string().optional(),
    sectionId: z.string().optional(),
    sectionNumber: z.number().optional(),
    sectionLabel: z.string().optional(),
    sectionFolderName: z.string().optional(),
    failureCode: z.enum(ATTACHMENT_ARCHIVE_FAILURE_CODES).optional(),
    failureMessage: z.string().optional(),
    blockedAttachment: AttachmentArchiveBlockedAttachmentSchema.optional(),
    errorMessage: z.string().optional(),
  })
  .passthrough();

export function parseAttachmentArchiveCurrent(
  value: string | undefined,
): AttachmentArchiveCurrent | undefined {
  if (!value) {
    return undefined;
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(value);
  } catch {
    return undefined;
  }

  const result = AttachmentArchiveCurrentSchema.safeParse(parsed);
  return result.success ? (result.data as AttachmentArchiveCurrent) : undefined;
}
