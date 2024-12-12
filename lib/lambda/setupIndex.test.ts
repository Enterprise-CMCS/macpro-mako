import { describe, it, expect, vi, beforeEach } from "vitest";
import { handler } from "./setupIndex";
import * as os from "../libs/opensearch-lib";

vi.mock("../libs/opensearch-lib", () => ({
  createIndex: vi.fn(),
  updateFieldMapping: vi.fn(),
}));

const mockedCreateIndex = vi.mocked(os.createIndex);
const mockedUpdateFieldMapping = vi.mocked(os.updateFieldMapping);

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

    expect(mockedCreateIndex).toHaveBeenCalledTimes(7);
    expect(mockedCreateIndex).toHaveBeenCalledWith(
      "test-domain",
      "test-namespace-main",
    );
    expect(mockedCreateIndex).toHaveBeenCalledWith(
      "test-domain",
      "test-namespace-changelog",
    );
    expect(mockedCreateIndex).toHaveBeenCalledWith(
      "test-domain",
      "test-namespace-types",
    );
    expect(mockedCreateIndex).toHaveBeenCalledWith(
      "test-domain",
      "test-namespace-subtypes",
    );
    expect(mockedCreateIndex).toHaveBeenCalledWith(
      "test-domain",
      "test-namespace-cpocs",
    );
    expect(mockedCreateIndex).toHaveBeenCalledWith(
      "test-domain",
      "test-namespace-insights",
    );
    expect(mockedCreateIndex).toHaveBeenCalledWith(
      "test-domain",
      "test-namespace-legacyinsights",
    );

    expect(mockedUpdateFieldMapping).toHaveBeenCalledTimes(1);
    expect(mockedUpdateFieldMapping).toHaveBeenCalledWith(
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
    (mockedCreateIndex as vi.Mock).mockRejectedValueOnce(new Error("Test error"));

    await handler(mockEvent, null, mockCallback);

    expect(mockedCreateIndex).toHaveBeenCalledTimes(1);
    expect(mockedUpdateFieldMapping).not.toHaveBeenCalled();

    expect(mockCallback).toHaveBeenCalledWith(expect.any(Error), {
      statusCode: 500,
    });
  });
});
