import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import { BrowserRouter } from "react-router";
import { describe, expect, it, vi } from "vitest";

import { Footer } from "./index";

// === MOCKS ===
vi.mock("@/api", () => ({
  useGetUser: () => ({
    data: {
      user: {
        "custom:ismemberof": "ONEMAC_USER",
        "custom:cms-roles": "", // Not a CMS role
      },
    },
  }),
}));

vi.mock("@/hooks/useFeatureFlag", () => ({
  useFeatureFlag: (flag: string) => flag === "STATE_HOMEPAGE_FLAG",
}));

vi.mock("shared-utils", () => ({
  isStateUser: () => true,
  isCmsUser: () => false,
}));

const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        cacheTime: 0,
      },
    },
  });

const renderWithProviders = (ui: React.ReactElement) =>
  render(
    <QueryClientProvider client={createTestQueryClient()}>
      <BrowserRouter>{ui}</BrowserRouter>
    </QueryClientProvider>,
  );

// === TESTS ===

describe("Footer", () => {
  it("renders email and address correctly", () => {
    renderWithProviders(
      <Footer
        email="testEmail@email.com"
        address={{
          city: "testCity",
          state: "testState",
          street: "testStreet",
          zip: 1234,
        }}
      />,
    );

    expect(screen.getByText("testEmail@email.com")).toBeInTheDocument();
    expect(screen.getByText("testCity, testState 1234")).toBeInTheDocument();
  });

  it("shows 'Latest Updates' link for state users with feature flag enabled", () => {
    renderWithProviders(
      <Footer
        email="stateuser@example.com"
        address={{
          city: "Baltimore",
          state: "MD",
          street: "7500 Security Blvd",
          zip: 21244,
        }}
      />,
    );

    const link = screen.getByRole("link", { name: /Latest Updates/i });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute("href", "/latestupdates");
  });

  it("does not show nav links if showNavLinks is false", () => {
    renderWithProviders(
      <Footer
        email="nonav@example.com"
        address={{
          city: "City",
          state: "ST",
          street: "123 Street",
          zip: 99999,
        }}
        showNavLinks={false}
      />,
    );

    expect(screen.queryByRole("link", { name: /Home/i })).not.toBeInTheDocument();
    expect(screen.queryByRole("link", { name: /Dashboard/i })).not.toBeInTheDocument();
    expect(screen.queryByRole("link", { name: /Latest Updates/i })).not.toBeInTheDocument();
    expect(screen.queryByRole("link", { name: /Support/i })).not.toBeInTheDocument();
  });
});

describe("FAQFooter", () => {
  it("renders when CHIP_SPA_SUBMISSION is false", async () => {
    vi.doMock("@/hooks/useFeatureFlag", () => ({
      useFeatureFlag: (flag: string) => flag !== "CHIP_SPA_SUBMISSION",
    }));

    const { FAQFooter } = await import("./index");
    renderWithProviders(<FAQFooter />);
    expect(screen.getByText("Do you have questions or need support?")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "View FAQs" })).toBeInTheDocument();
  });

  it("does not render when CHIP_SPA_SUBMISSION is true", async () => {
    vi.doMock("@/hooks/useFeatureFlag", () => ({
      useFeatureFlag: (flag: string) => flag === "CHIP_SPA_SUBMISSION",
    }));

    await vi.resetModules(); // Important: reset before import to apply the new mock

    const { FAQFooter } = await import("./index");
    renderWithProviders(<FAQFooter />);

    expect(screen.queryByText("Do you have questions or need support?")).not.toBeInTheDocument();
  });
});
