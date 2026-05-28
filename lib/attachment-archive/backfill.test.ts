import { afterEach, describe, expect, it, vi } from "vitest";

const { search, getDomainAndNamespace } = vi.hoisted(() => ({
  getDomainAndNamespace: vi.fn(() => ({
    domain: "https://example.com",
    index: "migratechangelog",
  })),
  search: vi.fn(),
}));

vi.mock("libs/opensearch-lib", () => ({
  search,
}));

vi.mock("../libs/utils", () => ({
  getDomainAndNamespace,
}));

import {
  ATTACHMENT_ARCHIVE_BACKFILL_PAGE_SIZE,
  filterActiveAttachmentArchivePackageIds,
  getAttachmentArchiveBackfillPage,
  isDeletedAttachmentArchivePackageId,
  listAllAttachmentArchiveSections,
} from "./backfill";

describe("attachment archive backfill helpers", () => {
  it("identifies and filters soft-deleted package ids", () => {
    expect(isDeletedAttachmentArchivePackageId("MD-22-0029-del")).toBe(true);
    expect(isDeletedAttachmentArchivePackageId("MD-22-0029")).toBe(false);

    expect(
      filterActiveAttachmentArchivePackageIds(["MD-1", "MD-2-del", "MD-3-del", "MD-4"]),
    ).toEqual({
      packageIds: ["MD-1", "MD-4"],
      skippedDeletedPackageCount: 2,
    });
  });

  afterEach(() => {
    search.mockReset();
    getDomainAndNamespace.mockClear();
  });

  it("uses the exact eligibility filter and fixed package page size", async () => {
    search.mockResolvedValue({
      aggregations: {
        values: {
          after_key: { packageId: "MD-2" },
          buckets: [{ key: { packageId: "MD-1" } }, { key: { packageId: "MD-2" } }],
        },
      },
    });

    const result = await getAttachmentArchiveBackfillPage({ afterKey: "MD-0" });

    expect(search).toHaveBeenCalledWith(
      "https://example.com",
      "migratechangelog",
      expect.objectContaining({
        aggs: {
          values: {
            composite: {
              after: { packageId: "MD-0" },
              size: ATTACHMENT_ARCHIVE_BACKFILL_PAGE_SIZE,
              sources: [
                {
                  packageId: {
                    terms: {
                      field: "packageId.keyword",
                    },
                  },
                },
              ],
            },
          },
        },
        query: {
          bool: {
            filter: [{ exists: { field: "attachments.key" } }],
            must_not: [{ term: { isAdminChange: true } }],
          },
        },
        size: 0,
      }),
    );
    expect(result).toEqual({
      afterKey: "MD-2",
      done: false,
      packageIds: ["MD-1", "MD-2"],
    });
  });

  it("pages exact package-section combinations for audit coverage", async () => {
    search
      .mockResolvedValueOnce({
        aggregations: {
          values: {
            after_key: { packageId: "MD-1", sectionId: "section-b" },
            buckets: [
              { key: { packageId: "MD-1", sectionId: "section-a" } },
              { key: { packageId: "MD-1", sectionId: "section-b" } },
            ],
          },
        },
      })
      .mockResolvedValueOnce({
        aggregations: {
          values: {
            buckets: [{ key: { packageId: "MD-2", sectionId: "section-c" } }],
          },
        },
      });

    await expect(listAllAttachmentArchiveSections()).resolves.toEqual([
      "MD-1::section-a",
      "MD-1::section-b",
      "MD-2::section-c",
    ]);

    expect(search).toHaveBeenNthCalledWith(
      1,
      "https://example.com",
      "migratechangelog",
      expect.objectContaining({
        aggs: {
          values: {
            composite: {
              size: 500,
              sources: [
                {
                  packageId: {
                    terms: {
                      field: "packageId.keyword",
                    },
                  },
                },
                {
                  sectionId: {
                    terms: {
                      field: "id.keyword",
                    },
                  },
                },
              ],
            },
          },
        },
      }),
    );
    expect(search).toHaveBeenNthCalledWith(
      2,
      "https://example.com",
      "migratechangelog",
      expect.objectContaining({
        aggs: {
          values: {
            composite: expect.objectContaining({
              after: { packageId: "MD-1", sectionId: "section-b" },
            }),
          },
        },
      }),
    );
  });
});
