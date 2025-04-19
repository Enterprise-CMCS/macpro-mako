import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { StateWelcome } from "./state";

// Mock useFeatureFlag to return true for STATE_HOMEPAGE_FLAG
vi.mock("@/hooks/useFeatureFlag", () => ({
  useFeatureFlag: vi.fn(() => true),
}));

// Mock LatestUpdates
vi.mock("@/components/Banner/latestUpdates", () => ({
  LatestUpdates: () => <div data-testid="latest-updates">Latest Updates Component</div>,
}));

describe("StateWelcome", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders all tabs", () => {
    render(
      <MemoryRouter>
        <StateWelcome />
      </MemoryRouter>,
    );

    expect(screen.getByText("Medicaid SPA")).toBeInTheDocument();
    expect(screen.getByText("CHIP SPA")).toBeInTheDocument();
    expect(screen.getByText("1915(b) waiver")).toBeInTheDocument();
    expect(screen.getByText("1915(c) waiver")).toBeInTheDocument();
    expect(screen.getByText("Request temporary waiver extension")).toBeInTheDocument();
  });

  it("defaults to Medicaid SPA active", () => {
    render(
      <MemoryRouter>
        <StateWelcome />
      </MemoryRouter>,
    );

    expect(screen.getByText(/submit all medicaid spas here/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /New Medicaid SPA/i })).toBeInTheDocument();
  });

  it("activates correct tab on click", () => {
    render(
      <MemoryRouter>
        <StateWelcome />
      </MemoryRouter>,
    );

    const chipTab = screen.getByText("CHIP SPA");
    fireEvent.click(chipTab);

    expect(screen.getByText("Submit a new CHIP state plan amendment.")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /New CHIP SPA/i })).toBeInTheDocument();
  });

  it("renders LatestUpdates component", () => {
    render(
      <MemoryRouter>
        <StateWelcome />
      </MemoryRouter>,
    );

    expect(screen.getByTestId("latest-updates")).toBeInTheDocument();
  });
});
