import { describe, it, expect, vi, afterEach } from "vitest";
import { handler } from "./setupIndex";
import { Context } from "aws-lambda";
import { OPENSEARCH_DOMAIN, OPENSEARCH_INDEX_NAMESPACE, errorCreateIndexHandler } from "mocks";
import { mockedServiceServer as mockedServer } from "mocks/server";
import * as os from "libs/opensearch-lib";

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
    ];

    for (const index of expectedIndices) {
      expect(createIndexSpy).toHaveBeenCalledWith(OPENSEARCH_DOMAIN, index);
    }
    expect(createIndexSpy).toHaveBeenCalledTimes(7);

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
    expect(updateMappingSpy).toHaveBeenCalledTimes(1);

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
