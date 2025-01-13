import { afterEach, describe, expect, it, vi } from "vitest";
import { bulkUpdateDataWrapper } from "./sink-lib";
import { OPENSEARCH_DOMAIN, OPENSEARCH_INDEX_NAMESPACE } from "mocks";
import * as os from "./opensearch-lib";

describe("bulkUpdateDataWrapper", () => {
  const bulkUpdateDataSpy = vi.spyOn(os, "bulkUpdateData");
  const DOCS = [{ id: "1" }];

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("calls bulkUpdateData with correct arguments when env vars are defined", async () => {
    await bulkUpdateDataWrapper(DOCS, "main");

    expect(bulkUpdateDataSpy).toHaveBeenCalledWith(
      OPENSEARCH_DOMAIN,
      `${OPENSEARCH_INDEX_NAMESPACE}main`,
      DOCS,
    );
  });

  it("throws an Error when env vars are missing", async () => {
    delete process.env.osDomain;
    delete process.env.indexNamespace;

    await expect(bulkUpdateDataWrapper(DOCS, "main")).rejects.toThrow();

    process.env.osDomain = OPENSEARCH_DOMAIN;

    await expect(bulkUpdateDataWrapper(DOCS, "main")).rejects.toThrow();

    process.env.indexNamespace = OPENSEARCH_INDEX_NAMESPACE;
  });
});
