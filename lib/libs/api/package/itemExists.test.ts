import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { itemExists } from "./itemExists";
import * as os from "../../../libs/opensearch-lib";
import * as utils from "libs/utils";
import { ItemResult } from "shared-types/opensearch/main";

vi.mock("../../../libs/opensearch-lib", () => ({
  getItem: vi.fn(),
}));

vi.mock("libs/utils", () => ({
  getDomain: vi.fn(),
  getOsNamespace: vi.fn(),
}));

describe("itemExists", () => {
  const mockDomain = "https://test-domain.com";
  const mockIndex = "test-main";
  const mockId = "test-id";

  beforeEach(() => {
    vi.mocked(utils.getDomain).mockReturnValue(mockDomain);
    vi.mocked(utils.getOsNamespace).mockReturnValue(mockIndex);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("should return true when item exists", async () => {
    // Since itemExists only checks if _source exists and is not null,
    // we can use a minimal mock that satisfies the type requirements
    const mockResponse = {
      _index: mockIndex,
      _id: mockId,
      _version: 1,
      _score: 1,
      sort: ["test"],
      found: true,
      _source: {
        id: mockId,
        title: "Test Package",
        additionalInformation: null,
        authority: "test",
        changedDate: "2025-02-03",
        cmsStatus: "pending",
        description: null,
        makoChangedDate: "2025-02-03",
        origin: "test",
        initialIntakeNeeded: false,
        raiWithdrawEnabled: false,
        seatoolStatus: "pending",
        state: "test-state",
        stateStatus: "pending",
        submissionDate: "2025-02-03",
        submitterEmail: "test@example.com",
        submitterName: "Test User",
        statusDate: "2025-02-03",
        proposedEffectiveDate: null,
        subject: null,
        actionType: "Test Action",
      },
    };

    vi.mocked(os.getItem).mockResolvedValue(mockResponse as unknown as ItemResult);

    const result = await itemExists({ id: mockId });
    expect(result).toBe(true);

    expect(utils.getDomain).toHaveBeenCalled();
    expect(utils.getOsNamespace).toHaveBeenCalledWith("main");
    expect(os.getItem).toHaveBeenCalledWith(mockDomain, mockIndex, mockId);
  });

  it("should return false when item does not exist", async () => {
    vi.mocked(os.getItem).mockResolvedValue(undefined);

    const result = await itemExists({ id: mockId });
    expect(result).toBe(false);

    expect(utils.getDomain).toHaveBeenCalled();
    expect(utils.getOsNamespace).toHaveBeenCalledWith("main");
    expect(os.getItem).toHaveBeenCalledWith(mockDomain, mockIndex, mockId);
  });

  it("should return false when getItem throws an error", async () => {
    vi.mocked(os.getItem).mockRejectedValue(new Error("Test error"));
    const consoleSpy = vi.spyOn(console, "error");

    const result = await itemExists({ id: mockId });
    expect(result).toBe(false);
    expect(consoleSpy).toHaveBeenCalledWith(new Error("Test error"));

    expect(utils.getDomain).toHaveBeenCalled();
    expect(utils.getOsNamespace).toHaveBeenCalledWith("main");
    expect(os.getItem).toHaveBeenCalledWith(mockDomain, mockIndex, mockId);
  });
});
