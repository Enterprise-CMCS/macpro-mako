import { fireEvent, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import * as hooks from "@/hooks/useFeatureFlag";
import { renderWithMemoryRouter } from "@/utils/test-helpers";

import StateWelcomeWrapper, { StateWelcome } from "./state";

const hookSpy = vi.spyOn(hooks, "useFeatureFlag").mockReturnValue(true);

// Mock LatestUpdates
vi.mock("@/components/Banner/latestUpdates", () => ({
  LatestUpdates: () => <div data-testid="latest-updates">Latest Updates Component</div>,
}));

describe("StateWelcome", () => {
  const setup = (comp: React.ReactElement) =>
    renderWithMemoryRouter(
      comp,
      [
        {
          path: "/",
          element: comp,
        },
      ],
      {
        initialEntries: ["/"],
      },
    );

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders all tabs", () => {
    setup(<StateWelcome />);

    expect(screen.getByText("Medicaid SPA")).toBeInTheDocument();
    expect(screen.getByText("CHIP SPA")).toBeInTheDocument();
    expect(screen.getByText("1915(b) waiver")).toBeInTheDocument();
    expect(screen.getByText("1915(c) waiver")).toBeInTheDocument();
    expect(screen.getByText("Request temporary waiver extension")).toBeInTheDocument();
  });

  it("defaults to Medicaid SPA active", () => {
    setup(<StateWelcome />);

    expect(screen.getByText(/submit all medicaid spas here/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /New Medicaid SPA/i })).toBeInTheDocument();
  });

  it("activates correct tab on click", () => {
    setup(<StateWelcome />);

    const chipTab = screen.getByText("CHIP SPA");
    fireEvent.click(chipTab);

    expect(screen.getByText("Submit a new CHIP state plan amendment.")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /New CHIP SPA/i })).toBeInTheDocument();
  });

  it("renders LatestUpdates component", () => {
    setup(<StateWelcome />);

    expect(screen.getByTestId("latest-updates")).toBeInTheDocument();
  });

  it("renders the Welcome page if the feature flag is off", () => {
    hookSpy.mockReturnValueOnce(false);

    setup(<StateWelcomeWrapper />);
    expect(screen.getByText("CMS Users")).toBeInTheDocument();
  });
});
