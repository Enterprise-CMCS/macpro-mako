import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import {
  CHP_ELIGIBILITY_GUIDES,
  CHP_MAGI_GUIDES,
  CHP_MED_EXPANSION_GUIDES,
  CHP_NON_FIN_GUIDES,
  ChipSpaImplementationGuides,
} from "./chip-spa-implementation-guides";
import {
  CHP_ELIGIBILITY_TEMPLATE,
  CHP_MAGI_TEMPLATES,
  CHP_MED_EXPANSION_TEMPLATES,
  CHP_NON_FIN_TEMPLATE,
  ChipSpaTemplates,
} from "./chip-spa-templates";
import { spaContent } from "./index";

const chipSpaTemplates = [
  ...CHP_MAGI_TEMPLATES,
  ...CHP_MED_EXPANSION_TEMPLATES,
  ...CHP_ELIGIBILITY_TEMPLATE,
  ...CHP_NON_FIN_TEMPLATE,
];

const chipSpaImplementationGuides = [
  ...CHP_MAGI_GUIDES,
  ...CHP_MED_EXPANSION_GUIDES,
  ...CHP_ELIGIBILITY_GUIDES,
  ...CHP_NON_FIN_GUIDES,
];

const compactTitle = (title: string) => title.replace(/\s+/g, "");

describe("CHIP SPA FAQ documents", () => {
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
    expect(templateLink).toHaveAttribute("download", "CS18.pdf");
    expect(guideLink).toHaveAttribute("href", "/chp/IG_CS18_Non-Financial-Citizenship.pdf");
    expect(guideLink).toHaveAttribute("download", "CS18 Implementation Guide.pdf");
  });

  it("uses descriptive, consistent download filenames for CHIP SPA templates and implementation guides", () => {
    render(
      <>
        <ChipSpaTemplates />
        <ChipSpaImplementationGuides />
      </>,
    );

    const templateLink = screen.getByRole("link", {
      name: "CS 23: Non-Financial Requirements - Other Eligibility Standards",
    });
    const guideLink = screen.getByRole("link", {
      name: "CS 23: Non-Financial Requirements - Other Eligibility Standards Implementation Guide",
    });
    const introductionLink = screen.getByRole("link", {
      name: "CHIP Eligibility Introduction",
    });

    expect(templateLink).toHaveAttribute("download", "CS23.pdf");
    expect(guideLink).toHaveAttribute("download", "CS23 Implementation Guide.pdf");
    expect(introductionLink).toHaveAttribute("download", "CHIP Eligibility Introduction.pdf");
  });

  it("assigns compact CS download names to all CHIP SPA template and guide entries", () => {
    for (const template of chipSpaTemplates) {
      expect(template.downloadName).toBe(`${compactTitle(template.title)}.pdf`);
    }

    for (const guide of chipSpaImplementationGuides) {
      expect(guide.downloadName).toBe(`${compactTitle(guide.title)} Implementation Guide.pdf`);
    }
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
