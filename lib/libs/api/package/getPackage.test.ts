// getPackage.test.ts
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import * as os from "libs/opensearch-lib";
import { getPackage, ExtendedItemResult } from "./getPackage";
import { getAppkChildren } from "./appk";

vi.mock("libs/opensearch-lib");
vi.mock("./appk");

describe("getPackage", () => {
  const mockOsDomain = "mock-os-domain";
  const mockIndexNamespace = "mock-index-namespace";
  const mockId = "mock-id";

  beforeEach(() => {
    process.env.osDomain = mockOsDomain;
    process.env.indexNamespace = mockIndexNamespace;
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("should throw an error if osDomain is not defined", async () => {
    delete process.env.osDomain;
    await expect(getPackage(mockId)).rejects.toThrow(
      "process.env.osDomain must be defined",
    );
  });

  it("should return the package result without appkChildren if appkParent is not present", async () => {
    const mockPackageResult = {
      _id: mockId,
      _source: {
        someField: "someValue",
      },
    } as ExtendedItemResult;

    vi.mocked(os.getItem).mockResolvedValue(mockPackageResult);

    const result = await getPackage(mockId);

    expect(os.getItem).toHaveBeenCalledWith(
      mockOsDomain,
      `${mockIndexNamespace}main`,
      mockId,
    );
    expect(result).toEqual(mockPackageResult);
  });

  it.skip("should return the package result with appkChildren if appkParent is present", async () => {
    const mockPackageResult = {
      _id: mockId,
      _source: {
        appkParent: "someParent",
        someField: "someValue",
      },
    } as ExtendedItemResult;

    const mockChildren = {
      hits: {
        hits: [{ childField: "childValue" }],
      },
    };

    vi.mocked(os.getItem).mockResolvedValue(mockPackageResult);
    vi.mocked(getAppkChildren).mockResolvedValue(mockChildren);

    const result = await getPackage(mockId);

    expect(os.getItem).toHaveBeenCalledWith(
      mockOsDomain,
      `${mockIndexNamespace}main`,
      mockId,
    );
    expect(getAppkChildren).toHaveBeenCalledWith(mockId);
    expect(result).toEqual({
      ...mockPackageResult,
      _source: {
        ...mockPackageResult._source,
        appkChildren: mockChildren.hits.hits,
      },
    });
  });
});
