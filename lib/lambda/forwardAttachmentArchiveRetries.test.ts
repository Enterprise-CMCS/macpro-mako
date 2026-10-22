import { afterEach, describe, expect, it, vi } from "vitest";

const { sendAttachmentArchiveRebuildRequest } = vi.hoisted(() => ({
  sendAttachmentArchiveRebuildRequest: vi.fn(),
}));

vi.mock("../attachment-archive/rebuild-queue", () => ({
  sendAttachmentArchiveRebuildRequest,
}));

import { handler } from "./forwardAttachmentArchiveRetries";

describe("forwardAttachmentArchiveRetries handler", () => {
  afterEach(() => {
    sendAttachmentArchiveRebuildRequest.mockReset();
  });

  it("forwards delayed retries to the primary rebuild queue", async () => {
    const message = {
      packageId: "MD-26-9999-P",
      preferDraft: true,
      source: "request",
      sourceScanPendingAt: "2026-06-15T10:00:00.000Z",
      sourceScanRetryCount: 3,
    };

    await handler(
      {
        Records: [{ body: JSON.stringify(message) }],
      } as any,
      {} as any,
      {} as any,
    );

    expect(sendAttachmentArchiveRebuildRequest).toHaveBeenCalledWith(message);
  });

  it("rejects malformed retry messages", async () => {
    await expect(
      handler(
        {
          Records: [{ body: JSON.stringify({ packageId: "MD-26-9999-P" }) }],
        } as any,
        {} as any,
        {} as any,
      ),
    ).rejects.toThrow("Attachment archive rebuild message must include packageId and source");

    expect(sendAttachmentArchiveRebuildRequest).not.toHaveBeenCalled();
  });
});
