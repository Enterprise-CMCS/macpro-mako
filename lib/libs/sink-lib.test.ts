import { afterEach, describe, expect, it, vi } from "vitest";
import * as os from "./opensearch-lib";
import { bulkUpdateDataWrapper } from "./sink-lib";
import { OPENSEARCH_DOMAIN, OPENSEARCH_INDEX_NAMESPACE } from "mocks";

describe("bulkUpdateDataWrapper", () => {
  const DOCS = [{ id: "1" }];

  afterEach(() => {
    vi.restoreAllMocks();
    vi.resetModules();
  });

  it("calls bulkUpdateData with correct arguments when env vars are defined", async () => {
    const mockBulkUpdateData = vi.spyOn(os, "bulkUpdateData").mockImplementation(vi.fn());

    vi.stubEnv("osDomain", OPENSEARCH_DOMAIN);
    vi.stubEnv("indexNamespace", OPENSEARCH_INDEX_NAMESPACE);

    await bulkUpdateDataWrapper(DOCS, "main");

    expect(mockBulkUpdateData).toHaveBeenCalledWith(
      OPENSEARCH_DOMAIN,
      `${OPENSEARCH_INDEX_NAMESPACE}main`,
      DOCS,
    );
  });

  it("throws an Error when env vars are missing", async () => {
    vi.stubEnv("osDomain", undefined);
    vi.stubEnv("indexNamespace", undefined);

    await expect(bulkUpdateDataWrapper(DOCS, "main")).rejects.toThrow(
      "osDomain is undefined in environment variables",
    );

    vi.stubEnv("osDomain", OPENSEARCH_DOMAIN);
    vi.stubEnv("indexNamespace", undefined);

    await expect(bulkUpdateDataWrapper(DOCS, "main")).rejects.toThrow(
      "indexName is undefined in environment variables",
    );
  });
});
