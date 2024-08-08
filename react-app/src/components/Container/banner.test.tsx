import { ReactNode } from "react";
import { Link, MemoryRouter, Route, Routes } from "react-router-dom";
import { describe, expect, test } from "vitest";
import { act, render } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { banner, Banner } from "../Banner";

const wrapper = ({ children }: { children: ReactNode }) => (
  <MemoryRouter initialEntries={["/dashboard"]}>
    <Routes>
      <Route
        path="/dashboard"
        element={<Link to="/example" data-testid="dashboard-link" />}
      />
      <Route
        path="/example"
        element={<Link to="/example" data-testid="example-link" />}
      />
    </Routes>
    {children}
  </MemoryRouter>
);

describe("banner", () => {
  test("Hidden on initial render", () => {
    const { queryByTestId } = render(<Banner />, { wrapper });

    expect(queryByTestId("banner-header")).not.toBeInTheDocument();
  });

  test("Check if banner is hidden on wrong pathnameToDisplayOn", () => {
    const { queryByTestId } = render(<Banner />, { wrapper });

    act(() => {
      banner({
        header: "Test header",
        body: "Test body",
        pathnameToDisplayOn: "/",
      });
    });

    expect(queryByTestId("banner-header")).not.toBeInTheDocument();
  });

  test("Check if banner is visible on correct pathnameToDisplayOn", () => {
    const { getByTestId } = render(<Banner />, { wrapper });

    act(() => {
      banner({
        header: "Test header",
        body: "Test body",
        pathnameToDisplayOn: "/dashboard",
      });
    });

    expect(getByTestId("banner-header")).toHaveTextContent("Test header");
  });

  test("Check if banner is closed when clicking the Close button", async () => {
    const { getByTestId, queryByTestId } = render(<Banner />, {
      wrapper,
    });
    const user = userEvent.setup();

    act(() => {
      banner({
        header: "Test header",
        body: "Test body",
        pathnameToDisplayOn: "/dashboard",
      });
    });

    await user.click(getByTestId("banner-close"));

    expect(queryByTestId("banner-header")).not.toBeInTheDocument();
  });

  test("Check if banner is closed when navigating away", async () => {
    const { getByTestId, queryByTestId } = render(<Banner />, {
      wrapper,
    });
    const user = userEvent.setup();

    act(() => {
      banner({
        header: "Test header",
        body: "Test body",
        pathnameToDisplayOn: "/dashboard",
      });
    });

    await user.click(getByTestId("dashboard-link"));

    expect(queryByTestId("banner-header")).not.toBeInTheDocument();
  });
});
