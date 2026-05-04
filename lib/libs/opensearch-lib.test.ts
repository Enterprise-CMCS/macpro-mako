import {
  errorUpdateFieldMappingHandler,
  OPENSEARCH_DOMAIN,
  OPENSEARCH_INDEX_NAMESPACE,
} from "mocks";
import { mockedServiceServer as mockedServer } from "mocks/server";
import { afterEach, describe, expect, it, vi } from "vitest";

import { decodeUtf8, getAwsSdkLogger, updateFieldMapping } from "./opensearch-lib";

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
      secretAccessKey: "test-secret-key", // pragma: allowlist secret
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
  describe("getAwsSdkLogger tests", () => {
    it("returns the global logger when it has the AWS logger methods", () => {
      const logger = {
        debug: vi.fn(),
        info: vi.fn(),
        warn: vi.fn(),
        error: vi.fn(),
      };
      vi.stubGlobal("logger", logger);

      expect(getAwsSdkLogger()).toBe(logger);
    });

    it("falls back to console when the global logger is incomplete", () => {
      vi.stubGlobal("logger", {
        debug: vi.fn(),
        info: vi.fn(),
      });

      expect(getAwsSdkLogger()).toBe(console);
    });
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

    it("should pass comma-separated multi-index searches through to OpenSearch", async () => {
      const body = {
        hits: {
          hits: [],
        },
      };
      const searchMock = vi.fn().mockResolvedValue({ body });
      const module = await importWithMockedClient({ search: searchMock });
      const multiIndex = `${OPENSEARCH_INDEX},${OPENSEARCH_INDEX_NAMESPACE}draftmain` as Parameters<
        typeof module.search
      >[1];
      const query = { size: 0 };

      const response = await module.search(OPENSEARCH_DOMAIN, multiIndex, query);

      expect(searchMock).toHaveBeenCalledWith({
        index: multiIndex,
        body: query,
      });
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
