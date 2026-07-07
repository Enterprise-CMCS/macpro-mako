import { screen, within } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import * as featureFlagHooks from "@/hooks/useFeatureFlag";
import * as hooks from "@/hooks/useHideBanner";
import { renderWithMemoryRouter } from "@/utils/test-helpers";

import { Welcome } from "./default";

const hookSpy = vi.spyOn(hooks, "useHideBanner");
const featureFlagSpy = vi.spyOn(featureFlagHooks, "useFeatureFlag");

describe("Default Welcome", () => {
  beforeEach(() => {
    featureFlagSpy.mockReturnValue(true);
  });

  const setup = () =>
    renderWithMemoryRouter(
      <Welcome />,
      [
        {
          path: "/",
          element: <Welcome />,
        },
      ],
      {
        initialEntries: ["/"],
      },
    );

  it("renders the page with banner hidden", () => {
    hookSpy.mockReturnValueOnce(true);
    setup();

    expect(screen.getByText(/Welcome to the official submission system/)).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "New and Notable", level: 2 }).parentElement,
    ).toHaveClass("hidden");
  });

  it("renders the page without banner hidden", () => {
    hookSpy.mockReturnValueOnce(false);

    setup();

    expect(screen.getByText(/Welcome to the official submission system/)).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "New and Notable", level: 2 }).parentElement,
    ).not.toHaveClass("hidden");
    expect(screen.getByText("Saving Draft Packages")).toBeInTheDocument();
    expect(
      screen.getByText(
        /New functionality has been added to OneMAC allowing state users to save a draft version/,
      ),
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Access State User Guide" })).toHaveAttribute(
      "href",
      "/faq/onboarding-materials",
    );
    expect(screen.getByText("Updated CS 18 SPA form")).toBeInTheDocument();
    expect(
      screen.getByText(
        "The CS 18 CHIP eligibility SPA template and implementation guide have been updated in OneMAC to include compliance attestations for changes made by section 71109 of the Working Families Tax Cut (WFTC) legislation effective October 1, 2026. These updates to the CS 18 will be effective starting July 7, 2026.",
      ),
    ).toBeInTheDocument();
    expect(screen.getByText("Updated CS 31 SPA form")).toBeInTheDocument();
    expect(
      screen.getByText(/The CS 31 CHIP eligibility SPA template and implementation guide/),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Access SPA templates and implementation guides" }),
    ).toHaveAttribute("href", "/faq/chip-spa-templates");

    const newAndNotableSection = screen
      .getByRole("heading", { name: "New and Notable", level: 2 })
      .closest("section");
    expect(newAndNotableSection).not.toBeNull();
    expect(
      within(newAndNotableSection as HTMLElement)
        .getAllByRole("heading", { level: 3 })
        .map((heading) => heading.textContent),
    ).toEqual(["Saving Draft Packages", "Updated CS 18 CHIP SPA form", "Updated CS 31 SPA form"]);

    const resourcesSection = screen.getByRole("heading", {
      name: "Resources",
      level: 2,
    }).parentElement;
    expect(resourcesSection).not.toBeNull();

    const spaTemplatesSection = within(resourcesSection as HTMLElement)
      .getByRole("heading", { name: "SPA Templates" })
      .closest("section");
    expect(spaTemplatesSection).not.toBeNull();
    expect(
      within(spaTemplatesSection as HTMLElement).getByRole("link", {
        name: "Medicaid Alternative Benefit Plan (ABP)",
      }),
    ).toHaveAttribute("href", "/faq/abp-spa-templates");
    expect(
      within(spaTemplatesSection as HTMLElement).getByRole("link", {
        name: "Medicaid Premiums and Cost Sharing",
      }),
    ).toHaveAttribute("href", "/faq/mpc-spa-templates");
    expect(
      within(spaTemplatesSection as HTMLElement).getByRole("link", { name: "CHIP eligibility" }),
    ).toHaveAttribute("href", "/faq/chip-spa-templates");

    const implementationGuidesSection = within(resourcesSection as HTMLElement)
      .getByRole("heading", { name: "SPA Implementation Guides" })
      .closest("section");
    expect(implementationGuidesSection).not.toBeNull();
    expect(
      within(implementationGuidesSection as HTMLElement).getByRole("link", {
        name: "Medicaid Alternative Benefit Plan (ABP)",
      }),
    ).toHaveAttribute("href", "/faq/abp-implementation-guides-spa");
    expect(
      within(implementationGuidesSection as HTMLElement).getByRole("link", {
        name: "Medicaid Premiums and Cost Sharing",
      }),
    ).toHaveAttribute("href", "/faq/mpc-spa-implementation-guides");
    expect(
      within(implementationGuidesSection as HTMLElement).getByRole("link", {
        name: "CHIP eligibility",
      }),
    ).toHaveAttribute("href", "/faq/chip-spa-implementation-guides");

    const userGuidesSection = within(resourcesSection as HTMLElement)
      .getByRole("heading", { name: "User guides" })
      .closest("section");
    expect(userGuidesSection).not.toBeNull();
    expect(
      within(userGuidesSection as HTMLElement).getByRole("link", { name: "State User Guide" }),
    ).toHaveAttribute("href", "/faq/onboarding-materials");
    expect(
      within(userGuidesSection as HTMLElement).getByRole("link", { name: "CMS User Guide" }),
    ).toHaveAttribute("href", "/faq/onboarding-materials");
  });

  it("hides the resources section when the homepage resources flag is off", () => {
    hookSpy.mockReturnValueOnce(false);
    featureFlagSpy.mockImplementation((flag) => flag !== "HOMEPAGE_RESOURCES");

    setup();

    expect(screen.getByText("Saving Draft Packages")).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "New and Notable", level: 2 }).parentElement,
    ).toHaveClass("m-auto", "max-w-[767px]");
    expect(screen.queryByRole("heading", { name: "Resources", level: 2 })).not.toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "SPA Templates" })).not.toBeInTheDocument();
  });
});
