import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router";
import { afterEach, describe, expect, it, vi } from "vitest";

import { useGetSystemNotifs } from "@/api";

import MMDLAlertBanner from "./MMDLSpaBanner";

vi.mock("@/api", () => ({
  useGetSystemNotifs: vi.fn(),
}));

const renderBanner = () =>
  render(
    <MemoryRouter>
      <MMDLAlertBanner />
    </MemoryRouter>,
  );

describe("MMDLAlertBanner", () => {
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
