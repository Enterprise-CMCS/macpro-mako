import { describe, expect, it } from "vitest";

import { buildAttachmentArchiveMessageGroupId } from "./rebuild-queue";

describe("attachment archive rebuild queue", () => {
  it("builds a stable fifo-compatible message group id", () => {
    const packageId = "CA-22-2020-hjfg TEST";
    const groupId = buildAttachmentArchiveMessageGroupId(packageId);

    expect(groupId).toMatch(/^package-[a-f0-9]{64}$/);
    expect(groupId.length).toBeLessThanOrEqual(128);
    expect(groupId).toBe(buildAttachmentArchiveMessageGroupId(packageId));
  });

  it("builds distinct group ids for distinct package ids", () => {
    expect(buildAttachmentArchiveMessageGroupId("MD-1")).not.toBe(
      buildAttachmentArchiveMessageGroupId("MD-2"),
    );
  });
});
