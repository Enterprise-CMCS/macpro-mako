import { opensearch } from "shared-types";
import { getPackageActivityLabelSlug } from "shared-utils";

import { buildSectionArchiveFolderName, getSectionArchiveRootFolderName } from "./archive-manifest";
import { AttachmentArchiveSectionInfo, AttachmentArchiveSourceAttachment } from "./types";

export type AttachmentArchiveChangelogDocument = {
  id: string;
  packageId?: string;
  event: opensearch.changelog.Document["event"];
  timestamp?: string | number;
  submitterName?: string;
  attachments?: opensearch.changelog.Document["attachments"];
  additionalInformation?: string | null;
  detailMessage?: string;
  isAdminChange?: boolean;
};

export type AttachmentArchiveChangelogItem = Omit<opensearch.changelog.ItemResult, "_source"> & {
  _source: AttachmentArchiveChangelogDocument;
};

export interface AttachmentArchiveSectionDescriptor extends AttachmentArchiveSectionInfo {
  packageId: string;
  attachments: AttachmentArchiveSourceAttachment[];
}

function isArchiveEligibleChangelogEntry(document: AttachmentArchiveChangelogDocument) {
  return !document.isAdminChange || document.event === "NOSO";
}

export function getArchiveEligibleChangelogEntries(
  changelog: AttachmentArchiveChangelogItem[],
): AttachmentArchiveChangelogDocument[] {
  return changelog
    .map((item) => item._source)
    .filter((document): document is AttachmentArchiveChangelogDocument => Boolean(document))
    .filter(isArchiveEligibleChangelogEntry);
}

function getArchiveEntryTimestamp(entry: AttachmentArchiveChangelogDocument) {
  return typeof entry.timestamp === "number" ? entry.timestamp : undefined;
}

function getSectionAttachments(
  entry: AttachmentArchiveChangelogDocument,
): AttachmentArchiveSourceAttachment[] {
  return (entry.attachments || []).map((attachment) => ({
    bucket: attachment.bucket,
    filename: attachment.filename,
    key: attachment.key,
    title: attachment.title,
    uploadDate: attachment.uploadDate,
  }));
}

function getArchiveSectionLabel(entry: AttachmentArchiveChangelogDocument): string {
  if (entry.id.endsWith("-draft-updated-activity")) {
    return "draft-updated";
  }

  if (entry.id.endsWith("-draft-activity")) {
    return "draft-created";
  }

  return getPackageActivityLabelSlug(entry.event);
}

export function buildAttachmentArchiveSections({
  packageId,
  changelog,
}: {
  packageId: string;
  changelog: AttachmentArchiveChangelogItem[];
}): AttachmentArchiveSectionDescriptor[] {
  return getArchiveEligibleChangelogEntries(changelog)
    .map((entry, originalIndex) => ({
      attachments: getSectionAttachments(entry),
      entry,
      originalIndex,
      timestamp: getArchiveEntryTimestamp(entry),
    }))
    .filter(({ attachments }) => attachments.length > 0)
    .sort((left, right) => {
      if (
        left.timestamp !== undefined &&
        right.timestamp !== undefined &&
        left.timestamp !== right.timestamp
      ) {
        return left.timestamp - right.timestamp;
      }

      return left.originalIndex - right.originalIndex;
    })
    .map(({ attachments, entry }, index) => {
      const sectionNumber = index + 1;
      const sectionLabel = getArchiveSectionLabel(entry);
      const sectionFolderName = buildSectionArchiveFolderName({ sectionNumber, sectionLabel });

      return {
        packageId,
        attachments,
        sectionId: entry.id,
        sectionNumber,
        sectionLabel,
        sectionFolderName,
        rootFolderName: getSectionArchiveRootFolderName({
          packageId,
          sectionNumber,
          sectionLabel,
        }),
      };
    });
}

export function getAttachmentArchiveSectionById({
  packageId,
  changelog,
  sectionId,
}: {
  packageId: string;
  changelog: AttachmentArchiveChangelogItem[];
  sectionId: string;
}): AttachmentArchiveSectionDescriptor | undefined {
  return buildAttachmentArchiveSections({ packageId, changelog }).find(
    (section) => section.sectionId === sectionId,
  );
}

export function hasArchiveableAttachments(changelog: AttachmentArchiveChangelogItem[]): boolean {
  return buildAttachmentArchiveSections({ packageId: "_", changelog }).length > 0;
}
