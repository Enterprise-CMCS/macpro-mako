import { screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import * as hooks from "@/hooks/useHideBanner";
import { renderWithMemoryRouter } from "@/utils/test-helpers";

import { Welcome } from "./default";

const hookSpy = vi.spyOn(hooks, "useHideBanner");

describe("Default Welcome", () => {
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
    expect(screen.getByText("Save in progress")).toBeInTheDocument();
    expect(
      screen.getByText(/New functionality has been added to OneMAC allowing state users/),
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Access state user guide" })).toHaveAttribute(
      "href",
      "/faq/onboarding-materials",
    );
    expect(screen.getByText("Updated CS31 SPA form")).toBeInTheDocument();
    expect(
      screen.getByText(/The CS 31 CHIP eligibility SPA template and implementation guide/),
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Access templates and guides" })).toHaveAttribute(
      "href",
      "/faq/chip-spa-templates",
    );

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
      within(userGuidesSection as HTMLElement).getByRole("link", { name: "State user guide" }),
    ).toHaveAttribute("href", "/faq/onboarding-materials");
    expect(
      within(userGuidesSection as HTMLElement).getByRole("link", { name: "CMS user guide" }),
    ).toHaveAttribute("href", "/faq/onboarding-materials");
  });
});
