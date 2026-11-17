import { renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { AUTHORITY_OPTIONS, SPA_OPTIONS, useChipSpaOptions, useMedSpaOptions } from "./options";

// Create mock implementation control
let mockChipSpaSubmissionFlag = false;
let mockMedSpaCardFlag = false;

vi.mock("@/hooks/useFeatureFlag", () => ({
  useFeatureFlag: (flag: string) => {
    if (flag === "CHIP_SPA_SUBMISSION") return mockChipSpaSubmissionFlag;
    if (flag === "MED_SPA_CARD") return mockMedSpaCardFlag;
    return false;
  },
}));

describe("CEntra selection cards", () => {
  it("mentions Community Engagement on the SPA and Medicaid SPA cards", () => {
    expect(AUTHORITY_OPTIONS[0].description).toBe(
      "Submit a new Medicaid or CHIP State Plan Amendment or Community Engagement Short-Term Hardship Exception",
    );
    expect(SPA_OPTIONS[0].description).toBe(
      "Submit a new Medicaid State Plan Amendment or Community Engagement Short-Term Hardship Exception",
    );
  });
});

describe("useMedSpaOptions", () => {
  beforeEach(() => {
    mockMedSpaCardFlag = false;
  });

  it("appends Additional Submissions last when the MMDL card is off", () => {
    const { result } = renderHook(() => useMedSpaOptions());

    expect(result.current.at(-1)).toMatchObject({
      title: "Additional Submissions",
      description: "Community Engagement Short-Term Hardship Exception",
      to: {
        pathname: "/new-submission/spa/medicaid/create/centra",
        search: "origin=spas",
      },
    });
    expect(result.current).toHaveLength(3);
  });

  it("appends Additional Submissions last when the MMDL card is on", () => {
    mockMedSpaCardFlag = true;
    const { result } = renderHook(() => useMedSpaOptions());

    expect(result.current).toHaveLength(4);
    expect(result.current.at(-1)?.title).toBe("Additional Submissions");
    expect(result.current[1].title).toContain("Alternative Benefits");
  });
});

describe("useChipSpaOptions", () => {
  beforeEach(() => {
    mockChipSpaSubmissionFlag = false;
    mockMedSpaCardFlag = false;
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
    expect(result.current[0].title).toBe("CHIP Eligibility SPA Submissions");
    expect(result.current[0].to).toMatchObject({
      pathname: "/new-submission/spa/chip/create/chip-details",
    });
    expect(result.current[1].title).toBe("All Other CHIP SPA Submissions");
    expect(result.current[1].to).toMatchObject({
      pathname: "/new-submission/spa/chip/create",
    });
  });
});
