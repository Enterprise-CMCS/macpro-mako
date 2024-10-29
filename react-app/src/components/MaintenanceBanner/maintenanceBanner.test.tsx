import { render, screen } from "@testing-library/react";
import { describe, vi, it, expect, beforeEach, afterEach } from "vitest";
import { MaintenanceBanner } from ".";
import { useLDClient } from "launchdarkly-react-client-sdk";
// import * as useLDClient from "launchdarkly-react-client-sdk";

// const useLDClient = vi.hoisted(() => vi.fn());

// vi.mock("launchdarkly-react-client-sdk", () => ({
//   useLDClient,
// }));
// vi.mock("launchdarkly-react-client-sdk", () => ({
//   useLDClient: vi.fn(),
// }));
// vi.mock("useLDClient");
vi.mock("launchdarkly-react-client-sdk", () => ({
  useLDClient: vi.fn().mockReturnValueOnce({
    variation: () => "SCHEDULED",
  }),
}));

describe("MaintenanceBanner", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it("renders the scheduled maintenance banner", () => {
    // vi.mocked(useLDClient).mockReturnValueOnce({
    //   variation: () => "SCHEDULED",
    // });
    // vi.mock("launchdarkly-react-client-sdk", () => ({
    //   useLDClient: vi.fn().mockReturnValueOnce({
    //     variation: () => "SCHEDULED",
    //   }),
    // }));
    // useLDClient.mockImplementation();
    render(<MaintenanceBanner />);

    expect(screen.getByText("Scheduled Maintenance Flag")).toBeVisible();
  });

  // it("renders the UNSCHEDULED maintenance banner", () => {
  //   // vi.mocked(useLDClient).mockReturnValueOnce({
  //   //   variation: () => "UNSCHEDULED",
  //   // });
  //   render(<MaintenanceBanner />);

  //   expect(screen.getByText("Unschedule Maintenance Flag")).toBeVisible();
  // });

  it("renders nothing if no maintenance flag is set", () => {
    // vi.mocked(useLDClient).mockReturnValueOnce({
    //   variation: () => undefined,
    // });
    // vi.mock("launchdarkly-react-client-sdk", () => ({
    //   useLDClient: vi.fn().mockReturnValueOnce({
    //     variation: () => undefined,
    //   }),
    // }));

    const { container } = render(<MaintenanceBanner />);

    expect(container.firstChild).toBeNull();
  });
});
