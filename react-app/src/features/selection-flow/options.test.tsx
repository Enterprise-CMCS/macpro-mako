import { renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { useChipSpaOptions } from "./options";

// Create mock implementation control
let mockChipSpaSubmissionFlag = false;

vi.mock("@/hooks/useFeatureFlag", () => ({
  useFeatureFlag: (flag: string) => {
    if (flag === "CHIP_SPA_SUBMISSION") return mockChipSpaSubmissionFlag;
    return false;
  },
}));

describe("useChipSpaOptions", () => {
  beforeEach(() => {
    mockChipSpaSubmissionFlag = false;
  });

  it("returns default CHIP options when CHIP_SPA_SUBMISSION is false", () => {
    const { result } = renderHook(() => useChipSpaOptions());

    expect(result.current).toHaveLength(2);
    expect(result.current[0].title).toBe("CHIP Eligibility");
    expect(result.current[0].to).toBe("/new-submission/spa/chip/landing/chip-eligibility");
    expect(result.current[1].title).toBe("All Other CHIP SPA Submissions");
    expect(result.current[1].to).toMatchObject({
      pathname: "/new-submission/spa/chip/create",
    });
  });

  it("returns chip-details options when CHIP_SPA_SUBMISSION is true", () => {
    mockChipSpaSubmissionFlag = true;

    const { result } = renderHook(() => useChipSpaOptions());

    expect(result.current).toHaveLength(2);
    expect(result.current[0].title).toBe("CHIP eligibility SPA submissions");
    expect(result.current[0].to).toMatchObject({
      pathname: "/new-submission/spa/chip/create/chip-details",
    });
    expect(result.current[1].title).toBe("All Other CHIP SPA Submissions");
    expect(result.current[1].to).toMatchObject({
      pathname: "/new-submission/spa/chip/create",
    });
  });
});
