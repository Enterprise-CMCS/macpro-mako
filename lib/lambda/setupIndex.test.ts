import { describe, it, expect, vi, beforeEach } from "vitest";
import { handler } from "./setupIndex";
import * as os from "../libs/opensearch-lib";

vi.mock("../libs/opensearch-lib", () => ({
  createIndex: vi.fn(),
  updateFieldMapping: vi.fn(),
}));

describe("handler", () => {
  const mockCallback = vi.fn();
  const mockEvent = {
    osDomain: "test-domain",
    indexNamespace: "test-namespace-",
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockCallback.mockClear();
  });

  it("should create and update indices without errors", async () => {
    await handler(mockEvent, null, mockCallback);

    expect(os.createIndex).toHaveBeenCalledTimes(7);
    expect(os.createIndex).toHaveBeenCalledWith(
      "test-domain",
      "test-namespace-main",
    );
    expect(os.createIndex).toHaveBeenCalledWith(
      "test-domain",
      "test-namespace-changelog",
    );
    expect(os.createIndex).toHaveBeenCalledWith(
      "test-domain",
      "test-namespace-types",
    );
    expect(os.createIndex).toHaveBeenCalledWith(
      "test-domain",
      "test-namespace-subtypes",
    );
    expect(os.createIndex).toHaveBeenCalledWith(
      "test-domain",
      "test-namespace-cpocs",
    );
    expect(os.createIndex).toHaveBeenCalledWith(
      "test-domain",
      "test-namespace-insights",
    );
    expect(os.createIndex).toHaveBeenCalledWith(
      "test-domain",
      "test-namespace-legacyinsights",
    );

    expect(os.updateFieldMapping).toHaveBeenCalledTimes(1);
    expect(os.updateFieldMapping).toHaveBeenCalledWith(
      "test-domain",
      "test-namespace-main",
      {
        approvedEffectiveDate: { type: "date" },
        changedDate: { type: "date" },
        finalDispositionDate: { type: "date" },
        proposedDate: { type: "date" },
        statusDate: { type: "date" },
        submissionDate: { type: "date" },
      },
    );

    expect(mockCallback).toHaveBeenCalledWith(null, { statusCode: 200 });
  });

  it("should handle errors and return status 500", async () => {
    (os.createIndex as vi.Mock).mockRejectedValueOnce(new Error("Test error"));

    await handler(mockEvent, null, mockCallback);

    expect(os.createIndex).toHaveBeenCalledTimes(1);
    expect(os.updateFieldMapping).not.toHaveBeenCalled();

    expect(mockCallback).toHaveBeenCalledWith(expect.any(Error), {
      statusCode: 500,
    });
  });
});
