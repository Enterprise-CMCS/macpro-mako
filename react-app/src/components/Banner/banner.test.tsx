import { ReactNode } from "react";
import { Link, MemoryRouter, Route, Routes } from "react-router";
import { describe, expect, test } from "vitest";
import { act, render } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { banner, Banner } from ".";

const wrapper = ({ children }: { children: ReactNode }) => (
  <MemoryRouter initialEntries={["/dashboard"]}>
    <Routes>
      <Route path="/dashboard" element={<Link to="/example" id="dashboard-link" />} />
      <Route path="/example" element={<Link to="/dashboard" id="example-link" />} />
    </Routes>
    {children}
  </MemoryRouter>
);

const testBanner = (path) => {
  return { header: "Test header", body: "Test body", pathnameToDisplayOn: path };
};

describe("banner", () => {
  test("Hidden on initial render", () => {
    const { queryByTestId } = render(<Banner />, { wrapper });

    expect(queryByTestId("banner-header")).not.toBeInTheDocument();
  });

  test("Check if banner is not rendered on wrong pathnameToDisplayOn", () => {
    const { queryByTestId } = render(<Banner />, { wrapper });

    act(() => {
      banner(testBanner("/"));
    });

    expect(queryByTestId("banner-header")).not.toBeInTheDocument();
  });

  test("Check if banner is visible on correct pathnameToDisplayOn", () => {
    const { getByTestId } = render(<Banner />, { wrapper });

    act(() => {
      banner(testBanner("/dashboard"));
    });

    expect(getByTestId("banner-header")).toHaveTextContent("Test header");
  });

  test("Check if banner header and body text match", () => {
    const { getByText } = render(<Banner />, { wrapper });

    act(() => {
      banner(testBanner("/dashboard"));
    });

    expect(getByText("Test header")).toBeInTheDocument();
    expect(getByText("Test body")).toBeInTheDocument();
  });

  test("Check if banner is closed when clicking the Close button", async () => {
    const { getByTestId, queryByTestId } = render(<Banner />, {
      wrapper,
    });
    const user = userEvent.setup();

    act(() => {
      banner(testBanner("/dashboard"));
    });

    await user.click(getByTestId("banner-close"));

    expect(queryByTestId("banner-header")).not.toBeInTheDocument();
  });

  test("Check if banner is closed when navigating away", async () => {
    const { container, queryByTestId } = render(<Banner />, {
      wrapper,
    });
    const user = userEvent.setup();

    act(() => {
      banner(testBanner("/dashboard"));
    });

    const dashboardLink = container.querySelector("#dashboard-link");
    expect(dashboardLink).toBeTruthy();
    if (dashboardLink) await user.click(dashboardLink);

    expect(queryByTestId("banner-header")).not.toBeInTheDocument();
  });

  test("Sets banner via localStorage", () => {
    render(<Banner />, { wrapper });

    act(() => {
      banner(testBanner("/dashboard"));
    });

    const storedBanner = JSON.parse(localStorage.getItem("banner"));

    expect(storedBanner).toEqual({
      header: "Test header",
      body: "Test body",
      pathnameToDisplayOn: "/dashboard",
    });
  });

  test("Dismissing banner removes localStorage entry", async () => {
    const { getByTestId, queryByTestId } = render(<Banner />, { wrapper });

    act(() => {
      banner(testBanner("/dashboard"));
    });

    const user = userEvent.setup();

    await user.click(getByTestId("banner-close"));

    expect(queryByTestId("banner-header")).not.toBeInTheDocument();
    expect(localStorage.getItem("banner")).toBeNull();
  });
});
