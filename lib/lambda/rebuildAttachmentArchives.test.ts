import { afterEach, describe, expect, it, vi } from "vitest";

const { buildDraftAttachmentChangelog, rebuildPackageAttachmentArchives } = vi.hoisted(() => ({
  buildDraftAttachmentChangelog: vi.fn(),
  rebuildPackageAttachmentArchives: vi.fn(),
}));

vi.mock("../attachment-archive/draft-package", () => ({
  buildDraftAttachmentChangelog,
}));

vi.mock("./attachmentArchive-lib", () => ({
  rebuildPackageAttachmentArchives,
}));

import * as packageApi from "../libs/api/package";
import { handler } from "./rebuildAttachmentArchives";

describe("rebuildAttachmentArchives handler", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    buildDraftAttachmentChangelog.mockReset();
    rebuildPackageAttachmentArchives.mockReset();
  });

  it("rebuilds draft archives from synthetic draft changelog when preferDraft is true", async () => {
    const draftSubmission = {
      id: "MD-26-9999-P",
      seatoolStatus: "Draft",
      draft: {
        data: {
          attachments: {},
        },
      },
    };
    const draftChangelog = [
      {
        _id: "MD-26-9999-P-draft-activity",
        _index: "draft-changelog",
        _score: 1,
        found: true,
        _source: {
          id: "MD-26-9999-P-draft-activity",
          packageId: "MD-26-9999-P",
          timestamp: 1772564996000,
          attachments: [],
        },
      },
    ];
    const getPackageChangelogSpy = vi.spyOn(packageApi, "getPackageChangelog");
    const getDraftPackageSpy = vi.spyOn(packageApi, "getDraftPackage").mockResolvedValue({
      found: true,
      _id: "MD-26-9999-P",
      _index: "draftmain",
      _score: 1,
      _source: draftSubmission,
    } as any);

    buildDraftAttachmentChangelog.mockReturnValue(draftChangelog);
    rebuildPackageAttachmentArchives.mockResolvedValue({
      packageId: "MD-26-9999-P",
      packageStatus: "READY",
      sectionResults: [],
    });

    await handler(
      {
        Records: [
          {
            body: JSON.stringify({
              packageId: "MD-26-9999-P",
              preferDraft: true,
              source: "request",
            }),
          },
        ],
      } as any,
      {} as any,
      {} as any,
    );

    expect(getDraftPackageSpy).toHaveBeenCalledWith("MD-26-9999-P");
    expect(buildDraftAttachmentChangelog).toHaveBeenCalledWith({
      packageId: "MD-26-9999-P",
      submission: draftSubmission,
    });
    expect(getPackageChangelogSpy).not.toHaveBeenCalled();
    expect(rebuildPackageAttachmentArchives).toHaveBeenCalledWith({
      packageId: "MD-26-9999-P",
      changelog: draftChangelog,
    });
  });

  it("rebuilds non-draft archives from the persisted changelog by default", async () => {
    const persistedChangelog = [
      {
        _id: "MD-26-9999-P",
        _index: "changelog",
        _score: 1,
        found: true,
        _source: {
          packageId: "MD-26-9999-P",
          timestamp: 1772564996000,
          attachments: [],
        },
      },
    ];
    const getPackageChangelogSpy = vi.spyOn(packageApi, "getPackageChangelog").mockResolvedValue({
      hits: {
        hits: persistedChangelog,
      },
    } as any);
    const getDraftPackageSpy = vi.spyOn(packageApi, "getDraftPackage");

    rebuildPackageAttachmentArchives.mockResolvedValue({
      packageId: "MD-26-9999-P",
      packageStatus: "READY",
      sectionResults: [],
    });

    await handler(
      {
        Records: [
          {
            body: JSON.stringify({
              packageId: "MD-26-9999-P",
              source: "sink-changelog",
            }),
          },
        ],
      } as any,
      {} as any,
      {} as any,
    );

    expect(getPackageChangelogSpy).toHaveBeenCalledWith("MD-26-9999-P");
    expect(getDraftPackageSpy).not.toHaveBeenCalled();
    expect(buildDraftAttachmentChangelog).not.toHaveBeenCalled();
    expect(rebuildPackageAttachmentArchives).toHaveBeenCalledWith({
      packageId: "MD-26-9999-P",
      changelog: persistedChangelog,
    });
  });
});
