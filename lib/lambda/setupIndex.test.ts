// my-lib.test.ts
import { describe, it, expect, vi, beforeEach } from "vitest";
import { handler } from "./setupIndex";
import * as opensearchLib from "libs/opensearch-lib";

const MOCK_EVENT = {
  osDomain: "test-domain",
  indexNamespace: "test-namespace-",
};
const MOCK_CALLBACK = vi.fn();

describe("handler", () => {
  const spiedOnUpdateFieldMapping = vi.spyOn(opensearchLib, "updateFieldMapping");

  beforeEach(() => {
    vi.resetAllMocks();
    MOCK_CALLBACK.mockClear();
  });

  it("should create and update indices without errors", async () => {
    const spiedOnCreateIndex = vi
      .spyOn(opensearchLib, "createIndex")
      .mockImplementation(() => Promise.resolve());

    await handler(MOCK_EVENT, expect.anything(), MOCK_CALLBACK);

    expect(spiedOnCreateIndex).toHaveBeenCalledTimes(7);

    const expectedIndices = [
      "test-namespace-main",
      "test-namespace-changelog",
      "test-namespace-types",
      "test-namespace-subtypes",
      "test-namespace-cpocs",
      "test-namespace-insights",
      "test-namespace-legacyinsights",
    ];

    for (const index of expectedIndices) {
      expect(opensearchLib.createIndex).toHaveBeenCalledWith("test-domain", index);
    }

    expect(spiedOnUpdateFieldMapping).toHaveBeenCalledTimes(1);
    expect(spiedOnUpdateFieldMapping).toHaveBeenCalledWith("test-domain", "test-namespace-main", {
      approvedEffectiveDate: { type: "date" },
      changedDate: { type: "date" },
      finalDispositionDate: { type: "date" },
      proposedDate: { type: "date" },
      statusDate: { type: "date" },
      submissionDate: { type: "date" },
    });

    expect(MOCK_CALLBACK).toHaveBeenCalledWith(null, { statusCode: 200 });
  });

  it("should handle errors and return status 500", async () => {
    const spiedOnCreateIndex = vi
      .spyOn(opensearchLib, "createIndex")
      .mockRejectedValueOnce(new Error("Test error"));

    await handler(MOCK_EVENT, expect.anything(), MOCK_CALLBACK);

    expect(spiedOnCreateIndex).toHaveBeenCalledTimes(1);
    expect(spiedOnUpdateFieldMapping).not.toHaveBeenCalled();
    expect(MOCK_CALLBACK).toHaveBeenCalledWith(expect.any(Error), {
      statusCode: 500,
    });
  });
});
