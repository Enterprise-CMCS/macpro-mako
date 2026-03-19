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
  return getArchiveEligibleChangelogEntries(changelog).reduce<AttachmentArchiveSectionDescriptor[]>(
    (sections, entry, index) => {
      const attachments = getSectionAttachments(entry);
      if (attachments.length === 0) {
        return sections;
      }

      const sectionNumber = index + 1;
      const sectionLabel = getPackageActivityLabelSlug(entry.event);
      const sectionFolderName = buildSectionArchiveFolderName({ sectionNumber, sectionLabel });

      sections.push({
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
      });

      return sections;
    },
    [],
  );
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
