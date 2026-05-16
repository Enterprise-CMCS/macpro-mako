import { opensearch, SEATOOL_STATUS } from "shared-types";
import { describe, expect, it } from "vitest";

import { buildDraftAttachmentChangelog } from "./draft-package";

const buildDraftSubmission = (
  draftOverrides: Partial<NonNullable<opensearch.main.Document["draft"]>> = {},
) =>
  ({
    id: "MD-26-9289-P",
    event: "app-k",
    seatoolStatus: SEATOOL_STATUS.DRAFT,
    submitterName: "George Harrison",
    submitterEmail: "george@example.com",
    makoChangedDate: "2026-04-21T20:05:42.000Z",
    draft: {
      createdAt: "2026-04-21T19:26:32.000Z",
      createdByEmail: "george@example.com",
      createdByName: "George Harrison",
      savedAt: "2026-04-21T20:05:42.000Z",
      updatedAt: "2026-04-21T20:05:42.000Z",
      updatedByEmail: "george@example.com",
      updatedByName: "George Harrison",
      data: {
        attachments: {
          appK: {
            label: "1915(c) Appendix K Amendment Waiver Template",
            files: [
              {
                bucket: "mako-main-attachments-123456789012",
                filename: "document.pdf",
                key: "document.pdf",
                uploadDate: 1,
              },
            ],
          },
        },
      },
      ...draftOverrides,
    },
  }) as opensearch.main.Document;

describe("buildDraftAttachmentChangelog", () => {
  it("uses the created draft activity id when the creator is the latest updater", () => {
    const changelog = buildDraftAttachmentChangelog({
      packageId: "MD-26-9289-P",
      submission: buildDraftSubmission(),
    });

    expect(changelog).toHaveLength(1);
    expect(changelog[0]._source).toMatchObject({
      id: "MD-26-9289-P-draft-activity",
      submitterName: "George Harrison",
      timestamp: Date.parse("2026-04-21T19:26:32.000Z"),
    });
  });

  it("uses the updated draft activity id when another user is the latest updater", () => {
    const changelog = buildDraftAttachmentChangelog({
      packageId: "MD-26-9289-P",
      submission: buildDraftSubmission({
        updatedAt: "2026-04-21T20:05:42.000Z",
        updatedByEmail: "ringo@example.com",
        updatedByName: "Ringo Starr",
      }),
    });

    expect(changelog).toHaveLength(1);
    expect(changelog[0]._source).toMatchObject({
      id: "MD-26-9289-P-draft-updated-activity",
      submitterName: "Ringo Starr",
      timestamp: Date.parse("2026-04-21T20:05:42.000Z"),
    });
  });
});
