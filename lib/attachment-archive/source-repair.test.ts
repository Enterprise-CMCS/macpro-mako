import { describe, expect, it } from "vitest";

import {
  buildSyntheticScannerInvokePayload,
  isManualCleanRetagEligible,
  upsertScanTags,
} from "./source-repair";

describe("attachment source repair helpers", () => {
  it("builds the expected synthetic scanner event payload", () => {
    expect(
      buildSyntheticScannerInvokePayload({
        bucket: "mako-main-attachments-123456789012",
        key: "example.doc",
      }),
    ).toEqual({
      Records: [
        {
          body: JSON.stringify({
            Records: [
              {
                s3: {
                  bucket: { name: "mako-main-attachments-123456789012" },
                  object: { key: "example.doc" },
                },
              },
            ],
          }),
        },
      ],
    });
  });

  it("replaces scan tags while preserving unrelated tags", () => {
    expect(
      upsertScanTags({
        existingTags: [
          { Key: "virusScanStatus", Value: "UKNOWNEXT" },
          { Key: "virusScanTimestamp", Value: "old" },
          { Key: "owner", Value: "test" },
        ],
        status: "CLEAN",
        timestamp: "12345",
      }),
    ).toEqual([
      { Key: "owner", Value: "test" },
      { Key: "virusScanStatus", Value: "CLEAN" },
      { Key: "virusScanTimestamp", Value: "12345" },
    ]);
  });

  it("only allows manual clean retag for approved main attachment files after redrive", () => {
    expect(
      isManualCleanRetagEligible({
        attemptedRedrive: true,
        bucket: "mako-main-attachments-123456789012",
        exists: true,
        filename: "file.doc",
        virusScanStatus: "UKNOWNEXT",
      }),
    ).toBe(true);

    expect(
      isManualCleanRetagEligible({
        attemptedRedrive: false,
        bucket: "mako-main-attachments-123456789012",
        exists: true,
        filename: "file.doc",
        virusScanStatus: "UKNOWNEXT",
      }),
    ).toBe(false);

    expect(
      isManualCleanRetagEligible({
        attemptedRedrive: true,
        bucket: "mako-main-attachments-123456789012",
        exists: true,
        filename: "file.exe",
        virusScanStatus: "UKNOWNEXT",
      }),
    ).toBe(false);

    expect(
      isManualCleanRetagEligible({
        attemptedRedrive: true,
        bucket: "mako-main-legacy-attachments-123456789012",
        exists: true,
        filename: "file.doc",
        virusScanStatus: "UKNOWNEXT",
      }),
    ).toBe(false);
  });
});
