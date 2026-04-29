import { afterEach, describe, expect, it, vi } from "vitest";

const { getAttachmentArchiveBackfillPage, sendAttachmentArchiveRebuildRequest } = vi.hoisted(
  () => ({
    getAttachmentArchiveBackfillPage: vi.fn(),
    sendAttachmentArchiveRebuildRequest: vi.fn(),
  }),
);

vi.mock("../attachment-archive/backfill", () => ({
  getAttachmentArchiveBackfillPage,
}));

vi.mock("../attachment-archive/rebuild-queue", () => ({
  sendAttachmentArchiveRebuildRequest,
}));

import { handler } from "./backfillAttachmentArchives";

describe("backfillAttachmentArchives handler", () => {
  afterEach(() => {
    getAttachmentArchiveBackfillPage.mockReset();
    sendAttachmentArchiveRebuildRequest.mockReset();
  });

  it("returns a page of package ids and enqueues each package through the rebuild queue", async () => {
    getAttachmentArchiveBackfillPage.mockResolvedValue({
      afterKey: "MD-2",
      done: false,
      packageIds: ["MD-1", "MD-2"],
    });

    const result = await handler({ afterKey: "MD-0", pageSize: 999 });

    expect(getAttachmentArchiveBackfillPage).toHaveBeenCalledWith({ afterKey: "MD-0" });
    expect(sendAttachmentArchiveRebuildRequest).toHaveBeenNthCalledWith(1, {
      packageId: "MD-1",
      source: "backfill",
    });
    expect(sendAttachmentArchiveRebuildRequest).toHaveBeenNthCalledWith(2, {
      packageId: "MD-2",
      source: "backfill",
    });
    expect(result).toEqual({
      afterKey: "MD-2",
      done: false,
      enqueuedCount: 2,
      packageIds: ["MD-1", "MD-2"],
    });
  });
});
