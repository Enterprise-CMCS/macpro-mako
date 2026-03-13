import { opensearch } from "shared-types";
import { describe, expect, it } from "vitest";

import { buildAttachmentArchiveSections } from "../attachment-archive/package-activity";

function buildChangelogItem({
  id,
  event = "new-medicaid-submission",
  attachmentCount = 0,
  isAdminChange = false,
}: {
  id: string;
  event?: opensearch.changelog.Document["event"];
  attachmentCount?: number;
  isAdminChange?: boolean;
}): opensearch.changelog.ItemResult {
  return {
    _source: {
      attachments: Array.from({ length: attachmentCount }, (_, index) => ({
        bucket: "bucket",
        filename: `file-${index + 1}.pdf`,
        key: `key-${index + 1}`,
        title: `Title ${index + 1}`,
      })),
      event,
      id,
      isAdminChange,
    },
  } as opensearch.changelog.ItemResult;
}

describe("attachment archive package activity helpers", () => {
  it("numbers visible sections in the same order shown to users", () => {
    const sections = buildAttachmentArchiveSections({
      packageId: "MD-25-2525-IJJJ",
      changelog: [
        buildChangelogItem({ id: "admin-change", isAdminChange: true }),
        buildChangelogItem({ id: "section-a", event: "new-medicaid-submission", attachmentCount: 1 }),
        buildChangelogItem({ id: "section-b", event: "respond-to-rai", attachmentCount: 2 }),
      ],
    });

    expect(sections.map((section) => ({
      id: section.sectionId,
      label: section.sectionLabel,
      number: section.sectionNumber,
      folder: section.sectionFolderName,
    }))).toEqual([
      {
        id: "section-a",
        label: "initial-package-submitted",
        number: 1,
        folder: "section-1-initial-package-submitted",
      },
      {
        id: "section-b",
        label: "rai-response-submitted",
        number: 2,
        folder: "section-2-rai-response-submitted",
      },
    ]);
  });

  it("counts non-attachment rows for numbering while only building sections with attachments", () => {
    const sections = buildAttachmentArchiveSections({
      packageId: "MD-25-2525-IJJJ",
      changelog: [
        buildChangelogItem({ id: "section-a", event: "new-medicaid-submission", attachmentCount: 1 }),
        buildChangelogItem({ id: "section-b", event: "withdraw-package", attachmentCount: 0 }),
        buildChangelogItem({ id: "section-c", event: "respond-to-rai", attachmentCount: 1 }),
      ],
    });

    expect(sections.map((section) => section.sectionFolderName)).toEqual([
      "section-1-initial-package-submitted",
      "section-3-rai-response-submitted",
    ]);
  });
});
