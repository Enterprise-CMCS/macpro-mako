import { render, screen } from "@testing-library/react";
import { createMemoryRouter, RouterProvider } from "react-router";
import { describe, expect, it, vi } from "vitest";

import { router } from "./router";

vi.mock(import("@/components"), async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    Layout: vi.fn(() => <div>Mock Layout</div>),
    TimeoutModal: vi.fn(() => <div>Mock TimeoutModal</div>),
  };
});

vi.mock(import("@/features"), async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    Welcome: () => <div data-testid="welcome-page">Mock Welcome</div>,
    Dashboard: () => <div data-testid="dashboard-page">Mock Dashboard</div>,
    dashboardLoader: vi.fn(),
    loader: vi.fn(),
  };
});

describe("RoutesWithTimeout", () => {
  it("should not render <TimeoutModal> on `/support` route", async () => {
    const testRouter = createMemoryRouter(router().routes[0].children, {
      initialEntries: ["/faq"],
    });

    render(<RouterProvider router={testRouter} />);

    expect(screen.queryByText("Mock TimeoutModal")).not.toBeInTheDocument();
  });

  it("should render <TimeoutModal> on `/dashboard` route", async () => {
    const testRouter = createMemoryRouter(router().routes[0].children, {
      initialEntries: ["/dashboard"],
    });

    render(<RouterProvider router={testRouter} />);

    expect(screen.getByText("Mock TimeoutModal")).toBeInTheDocument();
  });
});
