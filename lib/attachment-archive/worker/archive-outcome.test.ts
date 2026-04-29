import { describe, expect, it } from "vitest";

import { isAllAttachmentsUnavailableArchive } from "./archive-outcome";

describe("isAllAttachmentsUnavailableArchive", () => {
  it("returns true when all attachments were skipped", () => {
    expect(
      isAllAttachmentsUnavailableArchive({
        appendedAttachmentCount: 0,
        skippedAttachmentCount: 2,
      }),
    ).toBe(true);
  });

  it("returns false when nothing was appended or skipped", () => {
    expect(
      isAllAttachmentsUnavailableArchive({
        appendedAttachmentCount: 0,
        skippedAttachmentCount: 0,
      }),
    ).toBe(false);
  });

  it("returns false when at least one attachment was appended", () => {
    expect(
      isAllAttachmentsUnavailableArchive({
        appendedAttachmentCount: 1,
        skippedAttachmentCount: 2,
      }),
    ).toBe(false);
  });
});
