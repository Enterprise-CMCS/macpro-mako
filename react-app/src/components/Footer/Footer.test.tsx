import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import { BrowserRouter } from "react-router";
import { describe, expect, it, vi } from "vitest";

import { FAQFooter, Footer } from "./index";

// Mock the user as a state user
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

// Mock the feature flag for state homepage
vi.mock("@/hooks/useFeatureFlag", () => ({
  useFeatureFlag: (flag: string) => flag === "STATE_HOMEPAGE_FLAG",
}));

// Mock isStateUser utility
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

describe("Footer", () => {
  it("renders footer with email and address", () => {
    const queryClient = createTestQueryClient();

    render(
      <QueryClientProvider client={queryClient}>
        <Footer
          email="testEmail@email.com"
          address={{
            city: "testCity",
            state: "testState",
            street: "testStreet",
            zip: 1234,
          }}
        />
      </QueryClientProvider>,
    );

    expect(screen.getByText("testEmail@email.com")).toBeInTheDocument();
    expect(screen.getByText("testCity, testState 1234")).toBeInTheDocument();
  });

  it("shows 'Latest Updates' link for state users with flag enabled", () => {
    const queryClient = createTestQueryClient();

    render(
      <QueryClientProvider client={queryClient}>
        <Footer
          email="stateuser@example.com"
          address={{
            city: "Baltimore",
            state: "MD",
            street: "7500 Security Blvd",
            zip: 21244,
          }}
        />
      </QueryClientProvider>,
    );

    const latestUpdatesLink = screen.getByRole("link", { name: /Latest Updates/i });
    expect(latestUpdatesLink).toBeInTheDocument();
    expect(latestUpdatesLink).toHaveAttribute("href", "/latestupdates");
  });
});

describe("FAQFooter", () => {
  it("renders FAQ footer content", () => {
    render(
      <BrowserRouter>
        <FAQFooter />
      </BrowserRouter>,
    );

    expect(screen.getByText("View FAQs")).toBeInTheDocument();
    expect(screen.getByText("Do you have questions or need support?")).toBeInTheDocument();
  });
});
