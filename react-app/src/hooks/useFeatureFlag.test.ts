import { renderHook } from "@testing-library/react";
import { LDFlagSet, useFlags, useLDClient } from "launchdarkly-react-client-sdk";
import { beforeEach, describe, expect, it, Mock, vi } from "vitest";

import { useFeatureFlag } from "./useFeatureFlag";

// copying what I need from: https://github.com/bohdanbirdie/vitest-launchdarkly-mock
vi.mock("launchdarkly-react-client-sdk", async () => ({
  useLDClient: vi.fn(),
  useFlags: vi.fn(() => ({})),
}));

const mockUseLDClient = useLDClient as Mock;
const mockUseFlags = useFlags as Mock;

export const mockFlags = (flags: LDFlagSet) => {
  mockUseFlags.mockImplementation(() => flags);
};
mockUseLDClient.mockImplementation(() => ldClientMock);

const ldClientMock = {
  variation: vi.fn(),
};

describe("useFeatureFlag", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return false if ldClient is not available", () => {
    mockUseLDClient.mockReturnValueOnce(undefined);
    mockFlags({ toggleFaq: undefined });
    const { result } = renderHook(() => useFeatureFlag("TOGGLE_FAQ"));

    expect(result.current).toBe(false);
  });

  it('should return true if flag value is "on"', () => {
    ldClientMock.variation.mockReturnValue("on");
    mockFlags({ toggleFaq: "on" });
    const { result } = renderHook(() => useFeatureFlag("TOGGLE_FAQ"));
    expect(result.current).toBe(true);
  });

  it("should return true if flag value is true", () => {
    ldClientMock.variation.mockReturnValue(true);
    mockFlags({ toggleFaq: true });
    const { result } = renderHook(() => useFeatureFlag("TOGGLE_FAQ"));

    expect(result.current).toBe(true);
  });

  it("should return false if flag value is false", () => {
    ldClientMock.variation.mockReturnValue(false);
    mockFlags({ toggleFaq: false });
    const { result } = renderHook(() => useFeatureFlag("TOGGLE_FAQ"));

    expect(result.current).toBe(false);
  });
});
