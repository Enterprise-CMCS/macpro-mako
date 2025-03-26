import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { CMSWelcome } from "./cms";

// Mock LatestUpdates component
vi.mock("@/components/Banner/latestUpdates", () => ({
  LatestUpdates: () => <div data-testid="latest-updates">Mocked Latest Updates</div>,
}));

describe("CMSWelcome", () => {
  it("renders the Latest Updates section", () => {
    render(<CMSWelcome />);
    const banner = screen.getByTestId("latest-updates");
    expect(banner).toBeInTheDocument();
  });

  it("renders the Access Header", () => {
    render(<CMSWelcome />);
    expect(screen.getByText("Access more SPA and waiver systems")).toBeInTheDocument();
  });

  it("renders all 6 cards with titles", () => {
    render(<CMSWelcome />);
    expect(screen.getByText("MACPro System")).toBeInTheDocument();
    expect(screen.getByText("SEA Tool")).toBeInTheDocument();
    expect(screen.getByText("WMS")).toBeInTheDocument();
    expect(screen.getByText("eRegs")).toBeInTheDocument();
    expect(screen.getByText("Laserfische")).toBeInTheDocument();
    expect(screen.getByText("MMDL")).toBeInTheDocument();
  });

  it("renders all action buttons with correct labels", () => {
    render(<CMSWelcome />);
    expect(screen.getByText("Go to MACPro System")).toBeInTheDocument();
    expect(screen.getByText("Go to SEA Tool")).toBeInTheDocument();
    expect(screen.getByText("Go to WMS")).toBeInTheDocument();
    expect(screen.getByText("Go to eRegs")).toBeInTheDocument();
    expect(screen.getByText("Go to Laserfische")).toBeInTheDocument();
    expect(screen.getByText("Go to MMDL")).toBeInTheDocument();
  });
});
