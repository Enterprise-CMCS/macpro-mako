import { beforeAll, afterEach, describe, expect, it, vi } from "vitest";
import * as os from "./opensearch-lib";
import { bulkUpdateDataWrapper } from "./sink-lib";

describe("bulkUpdateDataWrapper", () => {
  const DOCS = [{ id: "1" }];
  const mockBulkUpdateData = vi.fn();

  beforeAll(() => {
    vi.spyOn(os, "bulkUpdateData").mockImplementation(mockBulkUpdateData);
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.resetModules();
  });

  it("calls bulkUpdateData with correct arguments when env vars are defined", async () => {
    vi.stubEnv("osDomain", "os-domain");
    vi.stubEnv("indexNamespace", "index-namespace");

    await bulkUpdateDataWrapper(DOCS, "main");

    expect(mockBulkUpdateData).toHaveBeenCalledWith("os-domain", "index-namespacemain", DOCS);
  });

  it("throws an Error when env vars are missing", async () => {
    vi.unstubAllEnvs();

    await expect(bulkUpdateDataWrapper(DOCS, "main")).rejects.toThrow(
      "osDomain is undefined in environment variables",
    );

    vi.stubEnv("osDomain", "os-domain");

    await expect(bulkUpdateDataWrapper(DOCS, "main")).rejects.toThrow(
      "indexName is undefined in environment variables",
    );
  });
});
