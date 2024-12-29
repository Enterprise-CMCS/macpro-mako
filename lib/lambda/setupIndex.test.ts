// my-lib.test.ts
import { describe, it, expect, vi, beforeEach } from "vitest";
import { handler } from "./setupIndex"; // The code that calls createIndex, updateFieldMapping
import { Context } from "aws-lambda";

// 1) Define mocks first
const mockCreateIndex = vi.fn();
const mockUpdateFieldMapping = vi.fn();


describe.skip("handler", () => {
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
    await handler(mockEvent, {} as Context, mockCallback);

    // 3. Use the mocked functions in the expectations:
    expect(mockCreateIndex).toHaveBeenCalledTimes(7);
    expect(mockCreateIndex).toHaveBeenCalledWith("test-domain", "test-namespace-main");
    expect(mockCreateIndex).toHaveBeenCalledWith("test-domain", "test-namespace-changelog");
    expect(mockCreateIndex).toHaveBeenCalledWith("test-domain", "test-namespace-types");
    expect(mockCreateIndex).toHaveBeenCalledWith("test-domain", "test-namespace-subtypes");
    expect(mockCreateIndex).toHaveBeenCalledWith("test-domain", "test-namespace-cpocs");
    expect(mockCreateIndex).toHaveBeenCalledWith("test-domain", "test-namespace-insights");
    expect(mockCreateIndex).toHaveBeenCalledWith("test-domain", "test-namespace-legacyinsights");

    expect(mockUpdateFieldMapping).toHaveBeenCalledTimes(1);
    expect(mockUpdateFieldMapping).toHaveBeenCalledWith("test-domain", "test-namespace-main", {
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
    // Make the first call to mockCreateIndex reject:
    mockCreateIndex.mockRejectedValueOnce(new Error("Test error"));

    await handler(mockEvent, {} as Context, mockCallback);

    expect(mockCreateIndex).toHaveBeenCalledTimes(1);
    expect(mockUpdateFieldMapping).not.toHaveBeenCalled();
    expect(mockCallback).toHaveBeenCalledWith(expect.any(Error), {
      statusCode: 500,
    });
  });
});
