import * as os from "libs/opensearch-lib";
import { SEATOOL_STATUS } from "shared-types";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { itemExists } from "./itemExists";

describe("api/package/itemExists", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    process.env.osDomain = "https://example-opensearch.local";
    process.env.indexNamespace = "drafts-";
  });

  it("returns false when a matching record is soft-deleted", async () => {
    vi.spyOn(os, "getItem").mockResolvedValue({
      found: true,
      _source: {
        id: "MD-25-2525-SAVE",
        deleted: true,
        seatoolStatus: SEATOOL_STATUS.DRAFT,
      },
    } as any);

    const exists = await itemExists({ id: "MD-25-2525-SAVE", includeDrafts: true });

    expect(exists).toBe(false);
  });

  it("returns false for active drafts when includeDrafts is false", async () => {
    vi.spyOn(os, "getItem").mockResolvedValue({
      found: true,
      _source: {
        id: "MD-25-2525-SAVE",
        deleted: false,
        seatoolStatus: SEATOOL_STATUS.DRAFT,
      },
    } as any);

    const exists = await itemExists({ id: "MD-25-2525-SAVE" });

    expect(exists).toBe(false);
  });

  it("returns true for active drafts when includeDrafts is true", async () => {
    vi.spyOn(os, "getItem").mockResolvedValue({
      found: true,
      _source: {
        id: "MD-25-2525-SAVE",
        deleted: false,
        seatoolStatus: SEATOOL_STATUS.DRAFT,
      },
    } as any);

    const exists = await itemExists({ id: "MD-25-2525-SAVE", includeDrafts: true });

    expect(exists).toBe(true);
  });

  it("returns true for active drafts in draftmain when main has no package", async () => {
    vi.spyOn(os, "getItem")
      .mockResolvedValueOnce(undefined as any)
      .mockResolvedValueOnce({
        found: true,
        _source: {
          id: "MD-25-2525-SAVE",
          deleted: false,
          seatoolStatus: SEATOOL_STATUS.DRAFT,
        },
      } as any);

    const exists = await itemExists({ id: "MD-25-2525-SAVE", includeDrafts: true });

    expect(exists).toBe(true);
  });
});
