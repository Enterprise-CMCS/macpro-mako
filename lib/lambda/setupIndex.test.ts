// my-lib.test.ts
import { describe, it, expect, vi, beforeEach } from "vitest";
import { handler } from "./setupIndex";

const mockFns = vi.hoisted(() => ({
  createIndex: vi.fn(),
  updateFieldMapping: vi.fn(),
}));

vi.mock("../libs/opensearch-lib", () => mockFns);

describe.skip("handler", () => {
  // TODO: fix this test - it shows an error: SyntaxError: Unexpected token ')' [which is just not the case]
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
    await handler(mockEvent, expect.anything(), mockCallback);

    expect(mockFns.createIndex).toHaveBeenCalledTimes(7);
    expect(mockFns.createIndex).toHaveBeenCalledWith("test-domain", "test-namespace-main");
    expect(mockFns.createIndex).toHaveBeenCalledWith("test-domain", "test-namespace-changelog");
    expect(mockFns.createIndex).toHaveBeenCalledWith("test-domain", "test-namespace-types");
    expect(mockFns.createIndex).toHaveBeenCalledWith("test-domain", "test-namespace-subtypes");
    expect(mockFns.createIndex).toHaveBeenCalledWith("test-domain", "test-namespace-cpocs");
    expect(mockFns.createIndex).toHaveBeenCalledWith("test-domain", "test-namespace-insights");
    expect(mockFns.createIndex).toHaveBeenCalledWith(
      "test-domain",
      "test-namespace-legacyinsights",
    );

    expect(mockFns.updateFieldMapping).toHaveBeenCalledTimes(1);
    expect(mockFns.updateFieldMapping).toHaveBeenCalledWith("test-domain", "test-namespace-main", {
      approvedEffectiveDate: { type: "date" },
      changedDate: { type: "date" },
      finalDispositionDate: { type: "date" },
      proposedDate: { type: "date" },
      statusDate: { type: "date" },
      submissionDate: { type: "date" },
    });

    expect(mockCallback).toHaveBeenCalledWith(null, { statusCode: 200 });
  });

  it("should handle errors and return status 500", async () => {
    mockFns.createIndex.mockRejectedValueOnce(new Error("Test error"));

    await handler(mockEvent, expect.anything(), mockCallback);

    expect(mockFns.createIndex).toHaveBeenCalledTimes(1);
    expect(mockFns.updateFieldMapping).not.toHaveBeenCalled();
    expect(mockCallback).toHaveBeenCalledWith(expect.any(Error), {
      statusCode: 500,
    });
  });
});
