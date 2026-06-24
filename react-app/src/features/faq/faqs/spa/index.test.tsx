import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { ChipSpaImplementationGuides } from "./chip-spa-implementation-guides";
import { ChipSpaTemplates } from "./chip-spa-templates";

const mockUseFeatureFlag = vi.hoisted(() => vi.fn());

vi.mock("@/hooks/useFeatureFlag", () => ({
  useFeatureFlag: mockUseFeatureFlag,
}));

describe("CS18 FAQ documents", () => {
  beforeEach(() => {
    mockUseFeatureFlag.mockReset();
  });

  it("serves the old CS18 template and implementation guide when the flag is off", () => {
    mockUseFeatureFlag.mockReturnValue(false);

    render(
      <>
        <ChipSpaTemplates />
        <ChipSpaImplementationGuides />
      </>,
    );

    const templateLink = screen.getByRole("link", {
      name: "CS 18: Non-Financial Eligibility - Citizenship",
    });
    const guideLink = screen.getByRole("link", {
      name: "CS 18: Non-Financial Eligibility - Citizenship Implementation Guide",
    });

    expect(templateLink).toHaveAttribute("href", "/chp/CS18.pdf");
    expect(templateLink).toHaveAttribute("download", "CS18.pdf");
    expect(guideLink).toHaveAttribute("href", "/chp/IG_CS18_Non-Financial-Citizenship.pdf");
    expect(guideLink).toHaveAttribute("download", "IG_CS18_Non-Financial-Citizenship.pdf");
    expect(mockUseFeatureFlag).toHaveBeenCalledWith("CHIP_CS18_FAQ_DOCUMENTS");
  });

  it("serves the updated CS18 template and implementation guide when the flag is on", () => {
    mockUseFeatureFlag.mockReturnValue(true);

    render(
      <>
        <ChipSpaTemplates />
        <ChipSpaImplementationGuides />
      </>,
    );

    const templateLink = screen.getByRole("link", {
      name: "CS 18: Non-Financial Eligibility - Citizenship",
    });
    const guideLink = screen.getByRole("link", {
      name: "CS 18: Non-Financial Eligibility - Citizenship Implementation Guide",
    });

    expect(templateLink).toHaveAttribute("href", "/chp/CS18_MOD_v2.pdf");
    expect(templateLink).toHaveAttribute("download", "CS18.pdf");
    expect(guideLink).toHaveAttribute("href", "/chp/IG_CS18_Non-Financial-Citizenship_v2.pdf");
    expect(guideLink).toHaveAttribute("download", "IG_CS18_Non-Financial-Citizenship.pdf");
    expect(mockUseFeatureFlag).toHaveBeenCalledWith("CHIP_CS18_FAQ_DOCUMENTS");
  });
});
