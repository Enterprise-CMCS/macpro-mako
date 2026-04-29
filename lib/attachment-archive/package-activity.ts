import { opensearch } from "shared-types";
import { getPackageActivityLabelSlug } from "shared-utils";

import { buildSectionArchiveFolderName, getSectionArchiveRootFolderName } from "./archive-manifest";
import { AttachmentArchiveSectionInfo, AttachmentArchiveSourceAttachment } from "./types";

export interface AttachmentArchiveSectionDescriptor extends AttachmentArchiveSectionInfo {
  packageId: string;
  attachments: AttachmentArchiveSourceAttachment[];
}

export function getArchiveEligibleChangelogEntries(
  changelog: opensearch.changelog.ItemResult[],
): opensearch.changelog.Document[] {
  return changelog
    .map((item) => item._source)
    .filter((document): document is opensearch.changelog.Document => Boolean(document))
    .filter((document) => !document.isAdminChange);
}

function getArchiveEntryTimestamp(entry: opensearch.changelog.Document) {
  return typeof entry.timestamp === "number" ? entry.timestamp : undefined;
}

function getSectionAttachments(
  entry: opensearch.changelog.Document,
): AttachmentArchiveSourceAttachment[] {
  return (entry.attachments || []).map((attachment) => ({
    bucket: attachment.bucket,
    filename: attachment.filename,
    key: attachment.key,
    title: attachment.title,
    uploadDate: attachment.uploadDate,
  }));
}

export function buildAttachmentArchiveSections({
  packageId,
  changelog,
}: {
  packageId: string;
  changelog: opensearch.changelog.ItemResult[];
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
      const sectionLabel = getPackageActivityLabelSlug(entry.event);
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
  changelog: opensearch.changelog.ItemResult[];
  sectionId: string;
}): AttachmentArchiveSectionDescriptor | undefined {
  return buildAttachmentArchiveSections({ packageId, changelog }).find(
    (section) => section.sectionId === sectionId,
  );
}

export function hasArchiveableAttachments(changelog: opensearch.changelog.ItemResult[]): boolean {
  return buildAttachmentArchiveSections({ packageId: "_", changelog }).length > 0;
}
