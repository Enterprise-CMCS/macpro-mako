import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, test, vi } from "vitest";

import { LatestUpdates } from "./latestUpdates";

vi.mock("@/api", async () => {
  return {
    useGetSystemNotifs: () => ({
      allNotifications: [
        {
          notifId: "9e38a211-5fd5-44ff-96cd-6d0a22a73a96",
          header: "Latest Updates",
          pubDate: "2025-01-07T12:20:56.160Z",
          expDate: "2025-08-07T11:21:50.210Z",
          body: "Body content 1",
          buttonLink: "/link-1",
        },
        {
          notifId: "9e38a211-5fd5-44ff-96cd-6d0a22a73a97",
          header: "Latest Updates",
          pubDate: "2025-01-06T10:00:00.000Z",
          expDate: "2025-07-01T00:00:00.000Z",
          body: "Body content 2",
          buttonLink: "",
        },
        {
          notifId: "9e38a211-5fd5-44ff-96cd-6d0a22a73a98",
          header: "Latest Updates",
          pubDate: "2025-01-05T09:00:00.000Z",
          expDate: "2025-06-30T00:00:00.000Z",
          body: "Body content 3",
          buttonLink: "",
        },
      ],
    }),
  };
});

describe("LatestUpdates Component", () => {
  beforeEach(() => {
    render(<LatestUpdates />);
  });

  test("renders the header", () => {
    expect(screen.getByText("Latest Updates")).toBeInTheDocument();
  });

  test("shows only one update by default", () => {
    expect(screen.getByText(/Body content 1/i)).toBeInTheDocument();
    expect(screen.queryByText(/Body content 2/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Body content 3/i)).not.toBeInTheDocument();
  });

  test("shows all updates after clicking 'Show more updates'", () => {
    fireEvent.click(screen.getByText("Show more updates"));
    expect(screen.getByText(/Body content 1/i)).toBeInTheDocument();
    expect(screen.getByText(/Body content 2/i)).toBeInTheDocument();
    expect(screen.getByText(/Body content 3/i)).toBeInTheDocument();
    expect(screen.getByText("Hide additional updates")).toBeInTheDocument();
  });

  test("hides updates again after clicking 'Hide additional updates'", () => {
    const toggleButton = screen.getByText("Show more updates");
    fireEvent.click(toggleButton); // show more
    fireEvent.click(screen.getByText("Hide additional updates")); // hide again
    expect(screen.getByText(/Body content 1/i)).toBeInTheDocument();
    expect(screen.queryByText(/Body content 2/i)).not.toBeInTheDocument();
  });
});
