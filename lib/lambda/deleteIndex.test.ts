import { Context } from "aws-lambda";
import * as os from "libs/opensearch-lib";
import { errorDeleteIndexHandler, OPENSEARCH_DOMAIN, OPENSEARCH_INDEX_NAMESPACE } from "mocks";
import { mockedServiceServer as mockedServer } from "mocks/server";
import { afterEach, describe, expect, it, vi } from "vitest";

import { handler } from "./deleteIndex";

describe("Lambda Handler", () => {
  const deleteIndexSpy = vi.spyOn(os, "deleteIndex");
  const callback = vi.fn();

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("should successfully delete all indices", async () => {
    const event = {
      osDomain: OPENSEARCH_DOMAIN,
      indexNamespace: OPENSEARCH_INDEX_NAMESPACE,
    };

    await handler(event, {} as Context, callback);

    const expectedIndices = [
      `${OPENSEARCH_INDEX_NAMESPACE}main`,
      `${OPENSEARCH_INDEX_NAMESPACE}changelog`,
      `${OPENSEARCH_INDEX_NAMESPACE}insights`,
      `${OPENSEARCH_INDEX_NAMESPACE}types`,
      `${OPENSEARCH_INDEX_NAMESPACE}subtypes`,
      `${OPENSEARCH_INDEX_NAMESPACE}legacyinsights`,
      `${OPENSEARCH_INDEX_NAMESPACE}cpocs`,
    ];

    expectedIndices.forEach((index) => {
      expect(deleteIndexSpy).toHaveBeenCalledWith(OPENSEARCH_DOMAIN, index);
    });

    expect(callback).toHaveBeenCalledWith(null, { statusCode: 200 });
  });

  it("should handle missing osDomain", async () => {
    const event = {
      indexNamespace: OPENSEARCH_INDEX_NAMESPACE,
    };

    await handler(event, {} as Context, callback);

    expect(callback).toHaveBeenCalledWith(expect.any(String), {
      statusCode: 500,
    });
  });

  it("should handle errors during index deletion", async () => {
    mockedServer.use(errorDeleteIndexHandler);

    const event = {
      osDomain: "test-domain",
      indexNamespace: "test-namespace-",
    };

    await handler(event, {} as Context, callback);

    expect(callback).toHaveBeenCalledWith(expect.any(Error), {
      statusCode: 500,
    });
  });
});
