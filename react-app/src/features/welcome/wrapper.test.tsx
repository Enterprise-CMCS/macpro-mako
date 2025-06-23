import { QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor } from "@testing-library/react";
import { setDefaultReviewer, setDefaultStateSubmitter, setMockUsername } from "mocks";
import { createMemoryRouter, RouterProvider } from "react-router";
import { describe, expect, it, vi } from "vitest";

import { useFeatureFlag } from "@/hooks/useFeatureFlag";
import { createTestQueryClient } from "@/utils/test-helpers";

import { loader } from "./utils";
import { WelcomeWrapper } from "./wrapper";

// Mock all dependencies
vi.mock("@/features", () => ({
  CMSWelcome: () => <div>CMS Welcome</div>,
  StateWelcome: () => <div>State Welcome</div>,
  Welcome: () => <div>Default Welcome</div>,
}));

vi.mock("@/hooks/useFeatureFlag", () => ({
  useFeatureFlag: vi.fn(),
}));

describe("WelcomeWrapper", () => {
  const setup = (loginFlag: boolean) => {
    const queryClient = createTestQueryClient();
    const router = createMemoryRouter(
      [
        {
          path: "/",
          element: <WelcomeWrapper />,
          loader: loader(queryClient, loginFlag),
          HydrateFallback: () => null,
        },
        {
          path: "/login",
          element: <div data-testid="Login">Login</div>,
        },
      ],
      {
        initialEntries: [
          {
            pathname: "/",
          },
        ],
      },
    );
    const rendered = render(<WelcomeWrapper />, {
      wrapper: () => (
        <QueryClientProvider client={queryClient}>
          <RouterProvider router={router} />
        </QueryClientProvider>
      ),
    });
    return {
      ...rendered,
    };
  };
  it("renders CMSWelcome for CMS user with flag", async () => {
    setDefaultReviewer();
    (useFeatureFlag as any).mockImplementation((flag: string) => flag === "CMS_HOMEPAGE_FLAG");

    setup(false);
    await waitFor(() => expect(screen.getByText("CMS Welcome")).toBeInTheDocument());
  });

  it("renders StateWelcome for State user with flag", async () => {
    setDefaultStateSubmitter();
    (useFeatureFlag as any).mockImplementation((flag: string) => flag === "STATE_HOMEPAGE_FLAG");

    setup(false);
    await waitFor(() => expect(screen.getByText("State Welcome")).toBeInTheDocument());
  });

  it("renders default Welcome for no user if the loginFlag is true", async () => {
    setMockUsername();
    (useFeatureFlag as any).mockReturnValue(false);

    setup(true);
    await waitFor(() => expect(screen.getByText("Default Welcome")).toBeInTheDocument());
  });

  it("redirects to login if the loginFlag is false", async () => {
    setMockUsername();
    (useFeatureFlag as any).mockReturnValue(false);

    setup(false);
    await waitFor(() => expect(screen.getByText("Login")).toBeInTheDocument());
  });
});
