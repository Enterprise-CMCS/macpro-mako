import { renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { ORIGIN, SPA_SUBMISSION_ORIGIN } from "@/utils";

import { useChipSpaOptions, useMedSpaOptions } from "./options";

// Mock feature flag values
let mockFlags: Record<string, boolean> = {};

vi.mock("@/hooks/useFeatureFlag", () => ({
  useFeatureFlag: (flag: string) => mockFlags[flag] ?? false,
}));

describe("Options Hooks", () => {
  beforeEach(() => {
    mockFlags = {
      CHIP_SPA_SUBMISSION: false,
      MEDSPA_CARD_VISIBLE: false,
    };
  });

  describe("useChipSpaOptions", () => {
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
      mockFlags.CHIP_SPA_SUBMISSION = true;

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

  describe("useMedSpaOptions", () => {
    it("returns default Medicaid SPA options when MEDSPA_CARD_VISIBLE is false", () => {
      const { result } = renderHook(() => useMedSpaOptions());

      expect(result.current).toHaveLength(2);
      expect(result.current[0].title).toBe(
        "Medicaid Eligibility, Enrollment, Administration, and Health Homes",
      );
      expect(result.current[0].to).toBe(
        "/new-submission/spa/medicaid/landing/medicaid-eligibility",
      );

      expect(result.current[1].title).toBe("All Other Medicaid SPA Submissions");
      expect(result.current[1].to).toMatchObject({
        pathname: "/new-submission/spa/medicaid/create",
        search: new URLSearchParams({ [ORIGIN]: SPA_SUBMISSION_ORIGIN }).toString(),
      });
    });

    it("returns extended Medicaid SPA options when MEDSPA_CARD_VISIBLE is true", () => {
      mockFlags.MEDSPA_CARD_VISIBLE = true;

      const { result } = renderHook(() => useMedSpaOptions());

      expect(result.current).toHaveLength(3);

      expect(result.current[0].title).toBe(
        "Medicaid Eligibility, Enrollment, Administration, and Health Homes",
      );
      expect(result.current[0].to).toBe(
        "/new-submission/spa/medicaid/landing/medicaid-eligibility",
      );

      expect(result.current[1].title).toBe(
        "Medicaid Alternative Benefits Plans (ABP), and Medicaid Premiums and Cost Sharing",
      );
      expect(result.current[1].to).toBe("/new-submission/spa/medicaid/landing/medicaid-abp");

      expect(result.current[2].title).toBe("All Other Medicaid SPA Submissions");
      expect(result.current[2].to).toMatchObject({
        pathname: "/new-submission/spa/medicaid/create",
        search: new URLSearchParams({ [ORIGIN]: SPA_SUBMISSION_ORIGIN }).toString(),
      });
    });
  });
});
