import * as opensearchLib from "libs/opensearch-lib";
import { NOT_FOUND_ITEM_ID, TEST_ITEM_ID } from "mocks";
import items from "mocks/data/items";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { checkIdentifierUsage } from "./checkIdentifierUsage";

// Mock the opensearch-lib
vi.mock("libs/opensearch-lib", () => ({
  search: vi.fn(),
}));

// Mock utils
vi.mock("libs/utils", () => ({
  getDomainAndNamespace: vi.fn(() => ({
    domain: "https://test-domain.es.amazonaws.com",
    index: "test-namespace-main",
  })),
}));

describe("checkIdentifierUsage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return exists: false when identifier is not found", async () => {
    vi.mocked(opensearchLib.search).mockResolvedValue({
      hits: {
        hits: [],
        total: { value: 0, relation: "eq" },
      },
    });

    const result = await checkIdentifierUsage(NOT_FOUND_ITEM_ID);

    expect(result).toEqual({
      exists: false,
    });
    expect(opensearchLib.search).toHaveBeenCalledWith(
      "https://test-domain.es.amazonaws.com",
      "test-namespace-main",
      expect.objectContaining({
        size: 1,
        query: {
          bool: {
            must: [
              {
                match: {
                  id: {
                    query: NOT_FOUND_ITEM_ID,
                    case_insensitive: true,
                  },
                },
              },
            ],
            must_not: [
              {
                term: { deleted: true },
              },
            ],
          },
        },
      }),
    );
  });

  it("should return exists: true with origin when identifier is found with OneMAC origin", async () => {
    const testItem = items[TEST_ITEM_ID];
    if (!testItem?._source) {
      throw new Error("Test item not found");
    }
    vi.mocked(opensearchLib.search).mockResolvedValue({
      hits: {
        hits: [testItem],
        total: { value: 1, relation: "eq" },
      },
    });

    const result = await checkIdentifierUsage(TEST_ITEM_ID);

    expect(result).toEqual({
      exists: true,
      origin: testItem._source.origin,
    });
  });

  it("should return exists: true with origin when identifier is found with SEATool origin", async () => {
    // Find an item with SEATool origin from test data
    const seatoolItem = Object.values(items).find((item) => item._source?.origin === "SEATool");
    expect(seatoolItem).toBeDefined();
    if (!seatoolItem?._id) {
      throw new Error("SEATool item not found");
    }

    vi.mocked(opensearchLib.search).mockResolvedValue({
      hits: {
        hits: [seatoolItem],
        total: { value: 1, relation: "eq" },
      },
    });

    const result = await checkIdentifierUsage(seatoolItem._id);

    expect(result).toEqual({
      exists: true,
      origin: "SEATool",
    });
  });

  it("should perform case-insensitive matching", async () => {
    const testItem = items[TEST_ITEM_ID];
    const lowerCaseId = TEST_ITEM_ID.toLowerCase();
    const upperCaseId = TEST_ITEM_ID.toUpperCase();

    vi.mocked(opensearchLib.search).mockResolvedValue({
      hits: {
        hits: [testItem],
        total: { value: 1, relation: "eq" },
      },
    });

    // Test with lowercase
    const resultLower = await checkIdentifierUsage(lowerCaseId);
    expect(resultLower.exists).toBe(true);
    expect(opensearchLib.search).toHaveBeenCalledWith(
      expect.any(String),
      expect.any(String),
      expect.objectContaining({
        query: {
          bool: {
            must: [
              {
                match: {
                  id: {
                    query: lowerCaseId,
                    case_insensitive: true,
                  },
                },
              },
            ],
            must_not: expect.any(Array),
          },
        },
      }),
    );

    // Test with uppercase
    vi.clearAllMocks();
    const resultUpper = await checkIdentifierUsage(upperCaseId);
    expect(resultUpper.exists).toBe(true);
    expect(opensearchLib.search).toHaveBeenCalledWith(
      expect.any(String),
      expect.any(String),
      expect.objectContaining({
        query: {
          bool: {
            must: [
              {
                match: {
                  id: {
                    query: upperCaseId,
                    case_insensitive: true,
                  },
                },
              },
            ],
            must_not: expect.any(Array),
          },
        },
      }),
    );
  });

  it("should exclude deleted documents", async () => {
    vi.mocked(opensearchLib.search).mockResolvedValue({
      hits: {
        hits: [],
        total: { value: 0, relation: "eq" },
      },
    });

    await checkIdentifierUsage("MD-DELETED-123");

    expect(opensearchLib.search).toHaveBeenCalledWith(
      expect.any(String),
      expect.any(String),
      expect.objectContaining({
        query: {
          bool: {
            must: expect.any(Array),
            must_not: [
              {
                term: { deleted: true },
              },
            ],
          },
        },
      }),
    );
  });

  it("should return exists: false when OpenSearch returns an error", async () => {
    vi.mocked(opensearchLib.search).mockRejectedValue(new Error("OpenSearch connection error"));

    const result = await checkIdentifierUsage("MD-ERROR-123");

    expect(result).toEqual({
      exists: false,
    });
  });

  it("should return exists: false when document has no origin field", async () => {
    const itemWithoutOrigin = {
      ...items[TEST_ITEM_ID],
      _source: {
        ...items[TEST_ITEM_ID]._source,
        origin: undefined,
      },
    };

    vi.mocked(opensearchLib.search).mockResolvedValue({
      hits: {
        hits: [itemWithoutOrigin],
        total: { value: 1, relation: "eq" },
      },
    });

    const result = await checkIdentifierUsage(TEST_ITEM_ID);

    expect(result).toEqual({
      exists: true,
      origin: undefined,
    });
  });

  it("should handle WMS origin", async () => {
    const wmsItem = {
      ...items[TEST_ITEM_ID],
      _source: {
        ...items[TEST_ITEM_ID]._source,
        origin: "WMS",
      },
    };

    vi.mocked(opensearchLib.search).mockResolvedValue({
      hits: {
        hits: [wmsItem],
        total: { value: 1, relation: "eq" },
      },
    });

    const result = await checkIdentifierUsage("MD-WMS-123");

    expect(result).toEqual({
      exists: true,
      origin: "WMS",
    });
  });

  it("should handle SMART origin", async () => {
    const smartItem = {
      ...items[TEST_ITEM_ID],
      _source: {
        ...items[TEST_ITEM_ID]._source,
        origin: "SMART",
      },
    };

    vi.mocked(opensearchLib.search).mockResolvedValue({
      hits: {
        hits: [smartItem],
        total: { value: 1, relation: "eq" },
      },
    });

    const result = await checkIdentifierUsage("MD-SMART-123");

    expect(result).toEqual({
      exists: true,
      origin: "SMART",
    });
  });
});
