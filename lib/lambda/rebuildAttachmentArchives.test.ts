import { afterEach, describe, expect, it, vi } from "vitest";

const {
  buildDraftAttachmentChangelog,
  rebuildPackageAttachmentArchives,
  sendAttachmentArchiveRebuildRequest,
} = vi.hoisted(() => ({
  buildDraftAttachmentChangelog: vi.fn(),
  rebuildPackageAttachmentArchives: vi.fn(),
  sendAttachmentArchiveRebuildRequest: vi.fn(),
}));

vi.mock("../attachment-archive/draft-package", () => ({
  buildDraftAttachmentChangelog,
}));

vi.mock("../attachment-archive/rebuild-queue", () => ({
  sendAttachmentArchiveRebuildRequest,
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
    sendAttachmentArchiveRebuildRequest.mockReset();
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
      archiveNamespace: "draft",
      packageId: "MD-26-9999-P",
      changelog: draftChangelog,
      failSourceScanPending: false,
      sourceScanPendingAt: undefined,
      sourceScanRetryCount: 0,
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
      archiveNamespace: "main",
      packageId: "MD-26-9999-P",
      changelog: persistedChangelog,
      failSourceScanPending: false,
      sourceScanPendingAt: undefined,
      sourceScanRetryCount: 0,
    });
  });

  it("requeues source-scan pending rebuilds with bounded backoff", async () => {
    vi.spyOn(packageApi, "getPackageChangelog").mockResolvedValue({
      hits: {
        hits: [],
      },
    } as any);
    rebuildPackageAttachmentArchives.mockResolvedValue({
      packageId: "MD-26-9999-P",
      packageStatus: "PENDING",
      sourceScanPending: true,
      sectionResults: [],
    });

    await handler(
      {
        Records: [
          {
            body: JSON.stringify({
              packageId: "MD-26-9999-P",
              source: "sink-changelog",
              sourceScanPendingAt: "2026-06-15T10:00:00.000Z",
              sourceScanRetryCount: 2,
            }),
          },
        ],
      } as any,
      {} as any,
      {} as any,
    );

    expect(sendAttachmentArchiveRebuildRequest).toHaveBeenCalledWith(
      {
        packageId: "MD-26-9999-P",
        source: "sink-changelog",
        sourceScanPendingAt: "2026-06-15T10:00:00.000Z",
        sourceScanRetryCount: 3,
      },
      { delaySeconds: 30 },
    );
  });

  it("does not requeue source-scan pending rebuilds after the retry cap", async () => {
    vi.spyOn(packageApi, "getPackageChangelog").mockResolvedValue({
      hits: {
        hits: [],
      },
    } as any);
    rebuildPackageAttachmentArchives.mockResolvedValue({
      packageId: "MD-26-9999-P",
      packageStatus: "FAILED",
      sourceScanPending: false,
      sectionResults: [],
    });

    await handler(
      {
        Records: [
          {
            body: JSON.stringify({
              packageId: "MD-26-9999-P",
              source: "sink-changelog",
              sourceScanPendingAt: "2026-06-15T10:00:00.000Z",
              sourceScanRetryCount: 20,
            }),
          },
        ],
      } as any,
      {} as any,
      {} as any,
    );

    expect(rebuildPackageAttachmentArchives).toHaveBeenCalledWith(
      expect.objectContaining({
        failSourceScanPending: true,
        sourceScanPendingAt: "2026-06-15T10:00:00.000Z",
        sourceScanRetryCount: 20,
      }),
    );
    expect(sendAttachmentArchiveRebuildRequest).not.toHaveBeenCalled();
  });
});
