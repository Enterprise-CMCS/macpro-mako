import {
  errorUpdateFieldMappingHandler,
  OPENSEARCH_DOMAIN,
  OPENSEARCH_INDEX_NAMESPACE,
} from "mocks";
import { mockedServiceServer as mockedServer } from "mocks/server";
import { afterEach, describe, expect, it, vi } from "vitest";

import { decodeUtf8, updateFieldMapping } from "./opensearch-lib";

const OPENSEARCH_INDEX = `${OPENSEARCH_INDEX_NAMESPACE}main`;

afterEach(() => {
  vi.doUnmock("@aws-sdk/credential-provider-node");
  vi.doUnmock("@opensearch-project/opensearch");
  vi.resetModules();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

async function importWithMockedClient(mockedClient: {
  get?: ReturnType<typeof vi.fn>;
  search?: ReturnType<typeof vi.fn>;
}) {
  vi.doMock("@aws-sdk/credential-provider-node", () => ({
    defaultProvider: () => async () => ({
      accessKeyId: "test-access-key",
      secretAccessKey: "test-secret-key",
      sessionToken: "test-session-token",
    }),
  }));

  vi.doMock("@opensearch-project/opensearch", () => ({
    Client: class MockClient {
      constructor() {
        return mockedClient;
      }
    },
    Connection: class MockConnection {},
    errors: {
      ResponseError: class ResponseError extends Error {
        statusCode?: number;
        meta?: { statusCode?: number };

        constructor(message = "Response Error") {
          super(message);
          this.name = "Response Error";
        }
      },
    },
  }));

  return await import("./opensearch-lib");
}

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
    });

    it("should handle cyclic objects without overflowing the call stack", () => {
      const value: Record<string, unknown> = {
        name: "test",
      };
      value.self = value;

      const decoded = decodeUtf8(value);

      expect(decoded).toMatchObject({
        name: "test",
      });
      expect(decoded.self).toBe(decoded);
    });
  });

  describe("response body decoding tests", () => {
    it("should return a decoded search body even when response meta is cyclic", async () => {
      const meta: Record<string, unknown> = {};
      meta.self = meta;
      const body = {
        aggregations: {
          values: {
            buckets: [{ key: { packageId: "MD-20-5758" } }],
          },
        },
      };
      const searchMock = vi.fn().mockResolvedValue({
        body,
        meta,
      });
      const module = await importWithMockedClient({ search: searchMock });

      const response = await module.search(OPENSEARCH_DOMAIN, OPENSEARCH_INDEX, {
        size: 0,
      });

      expect(searchMock).toHaveBeenCalledTimes(1);
      expect(response).toEqual(body);
    });

    it("should return a decoded item even when get response meta is cyclic", async () => {
      const meta: Record<string, unknown> = {};
      meta.self = meta;
      const body = {
        _id: "package-id",
        _source: {
          packageId: "MD-20-5758",
        },
        found: true,
      };
      const getMock = vi.fn().mockResolvedValue({
        body,
        meta,
      });
      const module = await importWithMockedClient({ get: getMock });

      const response = await module.getItem(OPENSEARCH_DOMAIN, OPENSEARCH_INDEX, "package-id");

      expect(getMock).toHaveBeenCalledTimes(1);
      expect(response).toEqual(body);
    });

    it("should return a decoded item for getItemAndThrowAllErrors even when response meta is cyclic", async () => {
      const meta: Record<string, unknown> = {};
      meta.self = meta;
      const body = {
        _id: "package-id",
        _source: {
          packageId: "MD-20-5758",
        },
        found: true,
      };
      const getMock = vi.fn().mockResolvedValue({
        body,
        meta,
      });
      const module = await importWithMockedClient({ get: getMock });

      const response = await module.getItemAndThrowAllErrors(
        OPENSEARCH_DOMAIN,
        OPENSEARCH_INDEX,
        "package-id",
      );

      expect(getMock).toHaveBeenCalledTimes(1);
      expect(response).toEqual(body);
    });
  });
});
