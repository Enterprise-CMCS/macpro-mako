import {
  errorUpdateFieldMappingHandler,
  OPENSEARCH_DOMAIN,
  OPENSEARCH_INDEX_NAMESPACE,
} from "mocks";
import { mockedServiceServer as mockedServer } from "mocks/server";
import { describe, expect, it, vi } from "vitest";

import { decodeUtf8, updateFieldMapping } from "./opensearch-lib";

const OPENSEARCH_INDEX = `${OPENSEARCH_INDEX_NAMESPACE}main`;

describe("opensearch-lib tests", () => {
  describe("updateFieldMapping tests", () => {
    it("should handle a server error when updating a field mapping", async () => {
      mockedServer.use(errorUpdateFieldMappingHandler);

      await expect(() =>
        updateFieldMapping(OPENSEARCH_DOMAIN, OPENSEARCH_INDEX, {
          throw: "error",
        }),
      ).rejects.toThrowError("Response Error");
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

      vi.unstubAllGlobals();
    });
  });
});
