import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  updateFieldMapping,
  decodeUtf8,
  bulkUpdateData,
  search,
  getItem,
  getItems,
  createIndex,
  OpenSearchDocument,
} from "./opensearch-lib";
import {
  OPENSEARCH_DOMAIN,
  OPENSEARCH_INDEX_NAMESPACE,
  errorUpdateFieldMappingHandler,
  rateLimitBulkUpdateDataHandler,
  errorDeleteIndexHandler,
} from "mocks";
import { mockedServiceServer as mockedServer } from "mocks/server";

const OPENSEARCH_INDEX = `${OPENSEARCH_INDEX_NAMESPACE}main`;

describe("opensearch-lib tests", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("updateFieldMapping tests", () => {
    it("should handle a server error when updating a field mapping", async () => {
      mockedServer.use(errorUpdateFieldMappingHandler);

      await expect(() =>
        updateFieldMapping(OPENSEARCH_DOMAIN, OPENSEARCH_INDEX, {
          throw: "error",
        }),
      ).rejects.toThrowError("Response Error");
    });

    it("should successfully update field mapping", async () => {
      const properties = { field: { type: "text" } };
      const result = await updateFieldMapping(OPENSEARCH_DOMAIN, OPENSEARCH_INDEX, properties);
      expect(result).toBeUndefined();
    });
  });

  describe("bulkUpdateData tests", () => {
    it("should handle empty document array", async () => {
      await bulkUpdateData(OPENSEARCH_DOMAIN, OPENSEARCH_INDEX, []);
      // Should not throw and exit early
    });

    it("should handle bulk update with success", async () => {
      const docs: OpenSearchDocument[] = [
        { id: "1", field: "value" },
        { id: "2", field: "value2" },
      ];
      await bulkUpdateData(OPENSEARCH_DOMAIN, OPENSEARCH_INDEX, docs);
      // Should complete without throwing
    });

    it("should handle bulk update with rate limit", async () => {
      vi.spyOn(console, "log").mockImplementation(() => {});
      const docs = [{ id: "1", field: "value" }];
      mockedServer.use(rateLimitBulkUpdateDataHandler);
      await bulkUpdateData(OPENSEARCH_DOMAIN, OPENSEARCH_INDEX, docs);
      expect(console.log).toHaveBeenCalledWith(expect.stringContaining("Rate limit exceeded"));
    });
  });

  describe("search tests", () => {
    it("should perform search successfully", async () => {
      const query = { match_all: {} };
      const result = await search(OPENSEARCH_DOMAIN, OPENSEARCH_INDEX, query);
      expect(result).toBeDefined();
      expect(result.hits).toBeDefined();
    });
  });

  describe("getItem tests", () => {
    it("should return undefined for non-existent item", async () => {
      const result = await getItem(OPENSEARCH_DOMAIN, OPENSEARCH_INDEX, "nonexistent");
      expect(result).toBeUndefined();
    });

    it("should return item when found", async () => {
      const result = await getItem(OPENSEARCH_DOMAIN, OPENSEARCH_INDEX, "existing");
      expect(result).toBeDefined();
      expect(result?._source).toBeDefined();
    });
  });

  describe("getItems tests", () => {
    it("should handle empty ids array", async () => {
      const result = await getItems([]);
      expect(result).toEqual([]);
    });

    it("should return found items", async () => {
      const result = await getItems(["1", "2"]);
      expect(result).toHaveLength(2);
    });
  });

  describe("createIndex tests", () => {
    it("should not create index if it exists", async () => {
      const result = await createIndex(OPENSEARCH_DOMAIN, OPENSEARCH_INDEX);
      expect(result).toBeUndefined();
    });

    it("should create index if it does not exist", async () => {
      mockedServer.use(errorDeleteIndexHandler);
      const result = await createIndex(OPENSEARCH_DOMAIN, OPENSEARCH_INDEX);
      expect(result).toBeUndefined();
    });
  });

  describe("decodeUtf8 tests", () => {
    it("should handle decoding an invalid string", () => {
      vi.stubGlobal("decodeURIComponent", () => {
        throw new Error("Bad format");
      });

      const value = "test%20value%%";
      const decoded = decodeUtf8(value);
      expect(decoded).toEqual(value);
    });

    it("should decode valid UTF-8 string", () => {
      const value = "Hello%20World";
      const decoded = decodeUtf8(value);
      expect(decoded).toEqual("Hello World");
    });

    it("should handle array of strings", () => {
      const array = ["test1", "test2"];
      const decoded = decodeUtf8(array);
      expect(decoded).toEqual(array);
    });

    it("should handle nested objects", () => {
      const obj = { key1: "value1", key2: { nested: "value2" } };
      const decoded = decodeUtf8(obj);
      expect(decoded).toEqual(obj);
    });
  });
});
