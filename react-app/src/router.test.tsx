import { render } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router";
import { describe, expect, it, vi } from "vitest";
import { router } from "./router";

import type { RouteObject } from "react-router";

vi.mock("@/components", () => ({
  TimeoutModal: () => <div data-testid="timeout-modal">Mocked TimeoutModal</div>,
  Layout: ({ children }) => <div>{children}</div>,
}));

vi.mock(import("@/features"), async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    Welcome: () => <div data-testid="welcome-page">Welcome</div>,
    Dashboard: () => <div data-testid="dashboard-page">Dashboard</div>,
    dashboardLoader: vi.fn(),
    loader: vi.fn(),
  };
});

describe("Router tests", () => {
  it("should not include <TimeoutModal /> by default", () => {
    const { queryByTestId } = render(
      <MemoryRouter initialEntries={["/"]}>
        <Routes>
          {(router.routes[0].children as RouteObject[]).map((route) => (
            <Route key={route.path} path={route.path} element={route.element} />
          ))}
        </Routes>
      </MemoryRouter>,
    );

    expect(queryByTestId("timeout-modal")).toBeNull();
  });

  it("should include <TimeoutModal /> in RoutesWithTimeout", () => {
    const { getByTestId } = render(
      <MemoryRouter initialEntries={["/dashboard"]}>
        <Routes>
          {(router.routes[0].children as RouteObject[]).map((route) => (
            <Route key={route.path} path={route.path} element={route.element} />
          ))}
        </Routes>
      </MemoryRouter>,
    );

    expect(getByTestId("timeout-modal")).toBeDefined();
  });
});
