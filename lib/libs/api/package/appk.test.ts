import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import * as os from "../../opensearch-lib";
import { getAppkChildren } from "./appk";
import { opensearch } from "shared-types";

vi.mock("../../opensearch-lib");

describe("getAppkChildren", () => {
  const mockOsDomain = "mock-os-domain";
  const mockIndexNamespace = "mock-index-namespace";
  const mockPackageId = "mock-package-id";
  const mockFilter = [{ term: { status: "active" } }];
  const mockResponse = {
    hits: {
      hits: [
        {
          _source: {
            timestamp: "2024-01-01T00:00:00Z",
            change: "Initial release",
          },
        },
      ],
    },
  } as unknown as opensearch.main.Response;

  beforeEach(() => {
    vi.resetModules();
    process.env.osDomain = mockOsDomain;
    process.env.indexNamespace = mockIndexNamespace;
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("should throw an error if osDomain is not defined", async () => {
    delete process.env.osDomain;
    await expect(getAppkChildren(mockPackageId)).rejects.toThrow(
      "process.env.osDomain must be defined",
    );
  });

  it("should return the children with the specified packageId and no additional filters", async () => {
    vi.mocked(os.search).mockResolvedValue(mockResponse);

    const result = await getAppkChildren(mockPackageId);

    expect(os.search).toHaveBeenCalledWith(
      mockOsDomain,
      `${mockIndexNamespace}main`,
      {
        from: 0,
        size: 200,
        query: {
          bool: {
            must: [{ term: { "appkParentId.keyword": mockPackageId } }],
          },
        },
      },
    );
    expect(result).toEqual(mockResponse);
  });

  it("should return the children with the specified packageId and additional filters", async () => {
    vi.mocked(os.search).mockResolvedValue(mockResponse);

    const result = await getAppkChildren(mockPackageId, mockFilter);

    expect(os.search).toHaveBeenCalledWith(
      mockOsDomain,
      `${mockIndexNamespace}main`,
      {
        from: 0,
        size: 200,
        query: {
          bool: {
            must: [
              { term: { "appkParentId.keyword": mockPackageId } },
              ...mockFilter,
            ],
          },
        },
      },
    );
    expect(result).toEqual(mockResponse);
  });
});
