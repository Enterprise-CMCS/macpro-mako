import { render, screen } from "@testing-library/react";
import { createMemoryRouter, RouterProvider } from "react-router";
import { afterEach, describe, expect, it, vi } from "vitest";

import { useGetUserDetails } from "@/api";

import { UserManagementGuard } from "./index";

vi.mock("@/api", () => ({
  useGetUserDetails: vi.fn(),
}));

const renderGuard = () => {
  const router = createMemoryRouter(
    [
      {
        path: "/",
        element: <UserManagementGuard />,
        children: [{ path: "usermanagement", element: <div>Protected Area</div> }],
      },
      { path: "/404", element: <div>Not Found</div> },
    ],
    { initialEntries: ["/usermanagement"] },
  );

  return render(<RouterProvider router={router} />);
};

describe("UserManagementGuard", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it("renders nothing while user details are loading", () => {
    (useGetUserDetails as any).mockReturnValue({ isLoading: true });

    const { container } = renderGuard();

    expect(container).toBeEmptyDOMElement();
  });

  it("renders the child route for allowed roles", () => {
    (useGetUserDetails as any).mockReturnValue({
      isLoading: false,
      data: { role: "systemadmin" },
    });

    renderGuard();

    expect(screen.getByText("Protected Area")).toBeInTheDocument();
  });

  it("redirects to /404 for disallowed roles", () => {
    (useGetUserDetails as any).mockReturnValue({
      isLoading: false,
      data: { role: "statesubmitter" },
    });

    renderGuard();

    expect(screen.getByText("Not Found")).toBeInTheDocument();
  });
});
