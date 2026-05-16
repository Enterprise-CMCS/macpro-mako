import { opensearch, SEATOOL_STATUS } from "shared-types";
import { afterEach, describe, expect, test, vi } from "vitest";

import { getItem } from "@/api/useGetItem";

import { documentPoller } from "./documentPoller";

vi.mock("@/api/useGetItem", () => ({
  getItem: vi.fn(),
}));

const packageRecord = {
  _source: {
    id: "MD-26-1234-P",
    authority: "Medicaid SPA",
    seatoolStatus: SEATOOL_STATUS.DRAFT,
  },
} as opensearch.main.ItemResult;

describe("documentPoller", () => {
  afterEach(() => {
    vi.useRealTimers();
    vi.clearAllMocks();
  });

  test("passes includeDraft to getItem when polling", async () => {
    vi.useFakeTimers();
    vi.mocked(getItem).mockResolvedValue(packageRecord);

    const poller = documentPoller(
      "MD-26-1234-P",
      ({ recordExists, isSpa }) => recordExists && isSpa,
      { includeDraft: true },
    );
    const result = poller.startPollingData();

    await vi.advanceTimersByTimeAsync(1000);

    await expect(result).resolves.toEqual({
      correctDataStateFound: true,
      maxAttemptsReached: false,
    });
    expect(getItem).toHaveBeenCalledWith("MD-26-1234-P", { includeDraft: true });
  });

  test("omits includeDraft by default", async () => {
    vi.useFakeTimers();
    vi.mocked(getItem).mockResolvedValue(packageRecord);

    const poller = documentPoller("MD-26-1234-P", ({ recordExists }) => recordExists);
    const result = poller.startPollingData();

    await vi.advanceTimersByTimeAsync(1000);

    await expect(result).resolves.toEqual({
      correctDataStateFound: true,
      maxAttemptsReached: false,
    });
    expect(getItem).toHaveBeenCalledWith("MD-26-1234-P", { includeDraft: undefined });
  });
});
