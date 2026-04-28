import { opensearch } from "shared-types";
import { describe, expect, it } from "vitest";

import { getArchiveDownloadFilename } from "./archive-manifest";
import {
  buildAttachmentArchiveSections,
  getAttachmentArchiveSectionById,
  hasArchiveableAttachments,
} from "./package-activity";

function buildChangelogItem({
  attachments = [
    {
      bucket: "mako-main-attachments-123456789012",
      filename: "document.pdf",
      key: "document.pdf",
      title: "Document",
      uploadDate: 1,
    },
  ],
  event = "new-medicaid-submission",
  id,
  isAdminChange = false,
  timestamp,
}: {
  attachments?: opensearch.changelog.Document["attachments"];
  event?: opensearch.changelog.Document["event"];
  id: string;
  isAdminChange?: boolean;
  timestamp?: number;
}): opensearch.changelog.ItemResult {
  return {
    _id: id,
    _index: "changelog",
    _score: 1,
    _source: {
      attachments,
      event,
      id,
      isAdminChange,
      timestamp,
    } as opensearch.changelog.Document,
  } as opensearch.changelog.ItemResult;
}

describe("buildAttachmentArchiveSections", () => {
  it("numbers attachment sections from oldest to newest and updates folder names", () => {
    const sections = buildAttachmentArchiveSections({
      packageId: "MD-26-9289-P",
      changelog: [
        buildChangelogItem({
          id: "newest",
          timestamp: 300,
          event: "respond-to-rai",
        }),
        buildChangelogItem({
          id: "oldest",
          timestamp: 100,
          event: "new-medicaid-submission",
        }),
        buildChangelogItem({
          id: "middle",
          timestamp: 200,
          event: "upload-subsequent-documents",
        }),
      ],
    });

    expect(sections.map((section) => section.sectionId)).toEqual(["oldest", "middle", "newest"]);
    expect(sections.map((section) => section.sectionNumber)).toEqual([1, 2, 3]);
    expect(sections.map((section) => section.sectionFolderName)).toEqual([
      "section-1-initial-package-submitted",
      "section-2-subsequent-documents-uploaded",
      "section-3-rai-response-submitted",
    ]);
    expect(sections.map((section) => section.rootFolderName)).toEqual([
      "MD-26-9289-P-section-1-initial-package-submitted",
      "MD-26-9289-P-section-2-subsequent-documents-uploaded",
      "MD-26-9289-P-section-3-rai-response-submitted",
    ]);
    expect(
      getArchiveDownloadFilename({
        packageId: "MD-26-9289-P",
        scope: "section",
        sectionNumber: sections[2].sectionNumber,
        sectionLabel: sections[2].sectionLabel,
      }),
    ).toBe("MD-26-9289-P-section-3-rai-response-submitted-attachments.zip");
  });

  it("ignores non-NOSO admin changes and entries without attachments when assigning section numbers", () => {
    const sections = buildAttachmentArchiveSections({
      packageId: "MD-26-9289-P",
      changelog: [
        buildChangelogItem({
          id: "newest",
          timestamp: 300,
          event: "respond-to-rai",
        }),
        buildChangelogItem({
          attachments: [],
          id: "no-attachments",
          timestamp: 200,
        }),
        buildChangelogItem({
          id: "admin-change",
          isAdminChange: true,
          event: "split-spa",
          timestamp: 150,
        }),
        buildChangelogItem({
          id: "noso-admin-change",
          isAdminChange: true,
          event: "NOSO",
          timestamp: 125,
        }),
        buildChangelogItem({
          id: "oldest",
          timestamp: 100,
          event: "new-medicaid-submission",
        }),
      ],
    });

    expect(sections.map((section) => section.sectionId)).toEqual([
      "oldest",
      "noso-admin-change",
      "newest",
    ]);
    expect(sections.map((section) => section.sectionNumber)).toEqual([1, 2, 3]);
  });

  it("uses original changelog order as the tiebreaker when timestamps match or are missing", () => {
    const changelog = [
      buildChangelogItem({
        id: "same-timestamp-first",
        timestamp: 200,
        event: "respond-to-rai",
      }),
      buildChangelogItem({
        id: "same-timestamp-second",
        timestamp: 200,
        event: "upload-subsequent-documents",
      }),
      buildChangelogItem({
        id: "missing-timestamp",
        timestamp: undefined,
      }),
    ];

    const sections = buildAttachmentArchiveSections({
      packageId: "MD-26-9289-P",
      changelog,
    });

    expect(sections.map((section) => section.sectionId)).toEqual([
      "same-timestamp-first",
      "same-timestamp-second",
      "missing-timestamp",
    ]);
    expect(
      getAttachmentArchiveSectionById({
        packageId: "MD-26-9289-P",
        changelog,
        sectionId: "same-timestamp-second",
      }),
    ).toMatchObject({
      sectionId: "same-timestamp-second",
      sectionNumber: 2,
    });
  });
});

describe("hasArchiveableAttachments", () => {
  it("reports true when a non-admin or NOSO changelog entry has attachments", () => {
    expect(
      hasArchiveableAttachments([
        buildChangelogItem({
          attachments: [],
          id: "no-attachments",
          timestamp: 100,
        }),
        buildChangelogItem({
          id: "admin-only",
          isAdminChange: true,
          event: "split-spa",
          timestamp: 200,
        }),
      ]),
    ).toBe(false);

    expect(
      hasArchiveableAttachments([
        buildChangelogItem({
          id: "with-attachments",
          timestamp: 300,
        }),
      ]),
    ).toBe(true);

    expect(
      hasArchiveableAttachments([
        buildChangelogItem({
          id: "noso-attachments",
          isAdminChange: true,
          event: "NOSO",
          timestamp: 400,
        }),
      ]),
    ).toBe(true);
  });
});
