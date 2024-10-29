import { render, screen } from "@testing-library/react";
import { describe, vi, it, expect, afterEach } from "vitest";
import { MaintenanceBanner } from ".";

vi.mock("launchdarkly-react-client-sdk", () => ({
  useLDClient: vi.fn().mockReturnValueOnce({
    variation: () => "SCHEDULED",
  }),
}));

// TODO: test unscheduled, need to mock different return value in each test
describe("MaintenanceBanner", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it("renders the scheduled maintenance banner", () => {
    render(<MaintenanceBanner />);

    expect(screen.getByText("Scheduled Maintenance Flag")).toBeVisible();
  });

  it("renders nothing if no maintenance flag is set", () => {
    const { container } = render(<MaintenanceBanner />);

    expect(container.firstChild).toBeNull();
  });
});
