import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router";
import { afterEach, describe, expect, it, vi } from "vitest";

import { useGetSystemNotifs } from "@/api";
import { FAQ_TAB } from "@/consts";

import SystemAlertBanner from "./SystemAlertBanner";

vi.mock("@/api", () => ({
  useGetSystemNotifs: vi.fn(),
}));

const renderBanner = () =>
  render(
    <MemoryRouter>
      <SystemAlertBanner />
    </MemoryRouter>,
  );

describe("SystemAlertBanner", () => {
  afterEach(() => {
    vi.resetAllMocks();
  });

  it("renders the latest active notification returned by the hook", () => {
    vi.mocked(useGetSystemNotifs).mockReturnValue({
      notifications: [
        {
          notifId: "latest-banner",
          header: "CS31 template and implementation guides available in OneMAC",
          body: "Latest active banner body",
          buttonText: "Go to FAQs",
          buttonLink: "/faq/spa-amendments",
          pubDate: "2026-03-12T00:00:00.000Z",
          expDate: "2026-03-20T00:00:00.000Z",
          disabled: false,
        },
        {
          notifId: "older-banner",
          header: "Older banner",
          body: "Older active banner body",
          buttonText: "Older CTA",
          buttonLink: "/faq",
          pubDate: "2026-03-10T00:00:00.000Z",
          expDate: "2026-03-20T00:00:00.000Z",
          disabled: false,
        },
      ],
      allNotifications: [],
      dismissed: [],
      clearNotif: vi.fn(),
      resetNotifs: vi.fn(),
    });

    renderBanner();

    expect(
      screen.getByText("CS31 template and implementation guides available in OneMAC"),
    ).toBeInTheDocument();
    expect(screen.getByText("Latest active banner body")).toBeInTheDocument();
    expect(screen.queryByText("Older active banner body")).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Go to FAQs" })).toHaveAttribute("target", FAQ_TAB);
  });

  it("opens the State User Guide notification link directly in a new window", () => {
    vi.mocked(useGetSystemNotifs).mockReturnValue({
      notifications: [
        {
          notifId: "state-user-guide-banner",
          header: "Save in progress functionality now available in OneMAC",
          body: "State users can now save their progress on new submissions in OneMAC.",
          buttonText: "More details",
          buttonLink: "/onboarding/OneMACStateUserGuide.pdf",
          pubDate: "2026-05-19T12:20:56.160Z",
          expDate: "2027-08-07T11:21:50.210Z",
          disabled: false,
        },
      ],
      allNotifications: [],
      dismissed: [],
      clearNotif: vi.fn(),
      resetNotifs: vi.fn(),
    });

    renderBanner();

    const link = screen.getByRole("link", { name: "More details" });
    expect(link).toHaveAttribute("href", "/onboarding/OneMACStateUserGuide.pdf");
    expect(link).toHaveAttribute("target", "_blank");
  });

  it("dismisses the selected notification", async () => {
    const clearNotif = vi.fn();
    vi.mocked(useGetSystemNotifs).mockReturnValue({
      notifications: [
        {
          notifId: "latest-banner",
          header: "Latest banner",
          body: "Latest active banner body",
          buttonText: "",
          buttonLink: "",
          pubDate: "2026-03-12T00:00:00.000Z",
          expDate: "2026-03-20T00:00:00.000Z",
          disabled: false,
        },
      ],
      allNotifications: [],
      dismissed: [],
      clearNotif,
      resetNotifs: vi.fn(),
    });

    renderBanner();

    await userEvent.setup().click(screen.getByRole("button", { name: "Dismiss" }));

    expect(clearNotif).toHaveBeenCalledWith("latest-banner");
  });

  it("renders nothing when there are no active notifications", () => {
    vi.mocked(useGetSystemNotifs).mockReturnValue({
      notifications: [],
      allNotifications: [],
      dismissed: [],
      clearNotif: vi.fn(),
      resetNotifs: vi.fn(),
    });

    const { container } = renderBanner();

    expect(container).toBeEmptyDOMElement();
  });
});
