import { ReactNode } from "react";
import { Link, MemoryRouter, Route, Routes } from "react-router";
import { describe, expect, test, vi } from "vitest";
import { act, render } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { banner, Banner } from ".";

const mockCookies: Record<string, string> = {};

vi.spyOn(document, "cookie", "get").mockImplementation(() =>
  Object.entries(mockCookies)
    .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
    .join("; "),
);

vi.spyOn(document, "cookie", "set").mockImplementation((cookieString: string) => {
  const [key, ...valParts] = cookieString.split("=");
  const value = valParts.join("=").split(";")[0];
  mockCookies[key.trim()] = decodeURIComponent(value);
});

const setMockCookie = (name: string, value: object) => {
  mockCookies[name] = JSON.stringify(value);
};

const wrapper = ({ children }: { children: ReactNode }) => (
  <MemoryRouter initialEntries={["/dashboard"]}>
    <Routes>
      <Route path="/dashboard" element={<Link to="/example" id="dashboard-link" />} />
      <Route path="/example" element={<Link to="/dashboard" id="example-link" />} />
    </Routes>
    {children}
  </MemoryRouter>
);

describe("banner", () => {
  test("Hidden on initial render", () => {
    const { queryByTestId } = render(<Banner />, { wrapper });

    expect(queryByTestId("banner-header")).not.toBeInTheDocument();
  });

  test("Check if banner is not rendered on wrong pathnameToDisplayOn", () => {
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

  test("Check if banner header and body text match", () => {
    const { getByText } = render(<Banner />, { wrapper });

    act(() => {
      banner({
        header: "Test header",
        body: "Test body",
        pathnameToDisplayOn: "/dashboard",
      });
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
    const { container, queryByTestId } = render(<Banner />, {
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

    const dashboardLink = container.querySelector("#dashboard-link");
    expect(dashboardLink).toBeTruthy();
    if (dashboardLink) await user.click(dashboardLink);

    expect(queryByTestId("banner-header")).not.toBeInTheDocument();
  });

  test("Sets banner via a cookie", () => {
    setMockCookie("banner", {
      header: "Test header",
      body: "Test body",
      pathnameToDisplayOn: "/dashboard",
    });

    const { getByTestId } = render(<Banner />, { wrapper });

    expect(getByTestId("banner-header")).toHaveTextContent("Test header");
    expect(getByTestId("banner-body")).toHaveTextContent("Test body");
  });

  test("Dismissing banner removes the cookie", async () => {
    setMockCookie("banner", {
      header: "Test header",
      body: "Test body",
      pathnameToDisplayOn: "/dashboard",
    });

    const { getByTestId, queryByTestId } = render(<Banner />, { wrapper });
    const user = userEvent.setup();

    await user.click(getByTestId("banner-close"));

    expect(queryByTestId("banner-header")).not.toBeInTheDocument();
    expect(document.cookie).toBe("banner=");
  });
});
