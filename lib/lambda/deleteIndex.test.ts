import { describe, it, expect, vi, Mock, beforeEach } from "vitest";
import { handler } from "./deleteIndex";
import * as os from "../libs/opensearch-lib";

vi.mock("libs/opensearch-lib", () => ({
  deleteIndex: vi.fn(),
}));

describe("Lambda Handler", () => {
  const callback = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should successfully delete all indices", async () => {
    const event = {
      osDomain: "test-domain",
      indexNamespace: "test-namespace-",
    };

    (os.deleteIndex as Mock).mockResolvedValueOnce(null);

    await handler(event, expect.anything(), callback);

    const expectedIndices = [
      "test-namespace-main",
      "test-namespace-changelog",
      "test-namespace-insights",
      "test-namespace-types",
      "test-namespace-subtypes",
      "test-namespace-legacyinsights",
      "test-namespace-cpocs",
    ];

    expectedIndices.forEach((index) => {
      expect(os.deleteIndex).toHaveBeenCalledWith("test-domain", index);
    });

    expect(callback).toHaveBeenCalledWith(null, { statusCode: 200 });
  });

  it("should handle missing osDomain", async () => {
    const event = {
      indexNamespace: "test-namespace-",
    };

    await handler(event, expect.anything(), callback);

    expect(callback).toHaveBeenCalledWith(expect.any(String), {
      statusCode: 500,
    });
  });

  it("should handle errors during index deletion", async () => {
    const event = {
      osDomain: "test-domain",
      indexNamespace: "test-namespace-",
    };

    (os.deleteIndex as Mock).mockRejectedValueOnce(new Error("Test error"));

    await handler(event, expect.anything(), callback);

    expect(callback).toHaveBeenCalledWith(expect.any(Error), {
      statusCode: 500,
    });
  });
});
