import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { ChipSpaImplementationGuides } from "./chip-spa-implementation-guides";
import { ChipSpaTemplates } from "./chip-spa-templates";
import { spaContent } from "./index";

describe("CS18 FAQ documents", () => {
  it("serves the CS18 template and implementation guide from the canonical PDF paths", () => {
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
    expect(templateLink).toHaveAttribute("download");
    expect(guideLink).toHaveAttribute("href", "/chp/IG_CS18_Non-Financial-Citizenship.pdf");
    expect(guideLink).toHaveAttribute("download");
  });

  it("marks CHIP eligibility template and implementation guide FAQs as updated", () => {
    expect(spaContent).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          question: "Where can I download CHIP eligibility SPA templates?",
          label: "Updated",
          labelColor: "green",
        }),
        expect.objectContaining({
          question: "Where can I download CHIP eligibility SPA implementation guides?",
          label: "Updated",
          labelColor: "green",
        }),
      ]),
    );
  });
});
