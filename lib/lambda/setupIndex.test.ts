import { Context } from "aws-lambda";
import * as os from "libs/opensearch-lib";
import { errorCreateIndexHandler, OPENSEARCH_DOMAIN, OPENSEARCH_INDEX_NAMESPACE } from "mocks";
import { mockedServiceServer as mockedServer } from "mocks/server";
import { afterEach, describe, expect, it, vi } from "vitest";

import { handler } from "./setupIndex";

describe("handler", () => {
  const baseEvent = {
    osDomain: OPENSEARCH_DOMAIN,
    indexNamespace: OPENSEARCH_INDEX_NAMESPACE,
  };
  const createIndexSpy = vi.spyOn(os, "createIndex");
  const updateMappingSpy = vi.spyOn(os, "updateFieldMapping");
  const callback = vi.fn();

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("should create and update indices without errors", async () => {
    await handler(baseEvent, {} as Context, callback);

    const expectedIndices = [
      `${OPENSEARCH_INDEX_NAMESPACE}main`,
      `${OPENSEARCH_INDEX_NAMESPACE}changelog`,
      `${OPENSEARCH_INDEX_NAMESPACE}types`,
      `${OPENSEARCH_INDEX_NAMESPACE}subtypes`,
      `${OPENSEARCH_INDEX_NAMESPACE}cpocs`,
      `${OPENSEARCH_INDEX_NAMESPACE}insights`,
      `${OPENSEARCH_INDEX_NAMESPACE}legacyinsights`,
      `${OPENSEARCH_INDEX_NAMESPACE}users`,
      `${OPENSEARCH_INDEX_NAMESPACE}roles`,
      `${OPENSEARCH_INDEX_NAMESPACE}datasink`,
    ];

    for (const index of expectedIndices) {
      expect(createIndexSpy).toHaveBeenCalledWith(OPENSEARCH_DOMAIN, index);
    }
    expect(createIndexSpy).toHaveBeenCalledTimes(10);

    expect(updateMappingSpy).toHaveBeenCalledWith(
      OPENSEARCH_DOMAIN,
      `${OPENSEARCH_INDEX_NAMESPACE}main`,
      {
        approvedEffectiveDate: { type: "date" },
        changedDate: { type: "date" },
        finalDispositionDate: { type: "date" },
        proposedDate: { type: "date" },
        statusDate: { type: "date" },
        submissionDate: { type: "date" },
      },
    );
    // main index and datasink index both have field mappings
    expect(updateMappingSpy).toHaveBeenCalledTimes(2);

    expect(callback).toHaveBeenCalledWith(null, { statusCode: 200 });
  });

  it("should handle errors and return status 500", async () => {
    mockedServer.use(errorCreateIndexHandler);

    await handler(baseEvent, {} as Context, callback);

    expect(createIndexSpy).toHaveBeenCalledTimes(1);
    expect(updateMappingSpy).not.toHaveBeenCalled();
    expect(callback).toHaveBeenCalledWith(expect.any(Error), {
      statusCode: 500,
    });
  });
});
