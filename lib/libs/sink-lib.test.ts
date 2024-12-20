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

    await bulkUpdateDataWrapper(DOCS, "main");

    expect(mockBulkUpdateData).toHaveBeenCalledWith(
      OPENSEARCH_DOMAIN,
      `${OPENSEARCH_INDEX_NAMESPACE}main`,
      DOCS,
    );
  });

  it("throws an Error when osDomain is missing", async () => {
    delete process.env.osDomain;

    await expect(bulkUpdateDataWrapper(DOCS, "main")).rejects.toThrow(
      "osDomain is undefined in environment variables",
    );
  });

  it("works when indexNamespace is undefined", async () => {
    const mockBulkUpdateData = vi.spyOn(os, "bulkUpdateData").mockImplementation(vi.fn());
    process.env.osDomain = OPENSEARCH_DOMAIN;
    delete process.env.indexNamespace;

    await bulkUpdateDataWrapper(DOCS, "main");

    expect(mockBulkUpdateData).toHaveBeenCalledWith(OPENSEARCH_DOMAIN, "undefinedmain", DOCS);
  });
});
