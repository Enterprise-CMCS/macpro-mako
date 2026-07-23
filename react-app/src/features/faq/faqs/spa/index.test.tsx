import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { ChipSpaImplementationGuides } from "./chip-spa-implementation-guides";
import { ChipSpaTemplates } from "./chip-spa-templates";
import { spaContent } from "./index";

const assetRoot = ["src/assets", "react-app/src/assets"]
  .map((assetPath) => join(process.cwd(), assetPath))
  .find(existsSync);

const getPdfTitle = (assetPath: string) => {
  if (!assetRoot) {
    throw new Error("Could not locate react-app asset root");
  }

  const pdf = readFileSync(join(assetRoot, assetPath), "latin1");
  return pdf.match(/<dc:title>[\s\S]*?<rdf:li xml:lang="x-default">([^<]*)<\/rdf:li>/)?.[1];
};

describe("SPA FAQ documents", () => {
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

  it("uses the CS27 template name as its PDF title", () => {
    expect(getPdfTitle("chp/CS27.pdf")).toBe("CS27");
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

  it("uses descriptive PDF titles for ABP and Premiums and Cost Sharing implementation guides", () => {
    expect(getPdfTitle("abp/IG_ABP2c_EnrollmentAssurancesMandatoryParticipants.pdf")).toBe(
      "ABP2c Implementation Guide",
    );
    expect(getPdfTitle("mpc/IG_G2b_CostSharingAmountsMN.pdf")).toBe("G2b Implementation Guide");
    expect(getPdfTitle("mpc/IG_P&CSSpaImplemntationGuide.pdf")).toBe(
      "Premiums and Cost Sharing Public Notice and General Information Implementation Guide",
    );
    expect(getPdfTitle("abp/IG_AbpGeneralInfoImplementationGuide.pdf")).toBe(
      "ABP General Information Implementation Guide",
    );
  });
});
