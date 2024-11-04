import { describe, it, expect, beforeAll, beforeEach, vi } from "vitest";
import { Layout } from "./index";
import { render, screen } from "@testing-library/react";
import { createMemoryRouter, RouterProvider } from "react-router-dom";
import {
  QueryClient,
  QueryClientProvider,
  UseQueryResult,
} from "@tanstack/react-query";
import userEvent from "@testing-library/user-event";
import { useGetUser } from "@/api";
import { testStateCognitoUser } from "shared-utils/testData";
import { OneMacUser } from "@/api/useGetUser";
import { Auth } from "aws-amplify";

// Mock components
vi.mock("../UsaBanner", () => ({
  UsaBanner: () => null,
}));

vi.mock("../Footer", () => ({
  Footer: () => null,
}));

vi.mock("@/components", () => ({
  SimplePageContainer: ({ children }: { children: React.ReactNode }) =>
    children,
  UserPrompt: () => null,
  Banner: () => null,
}));

// Complete mock user response with all required UseQueryResult properties
const mockUserResponse: UseQueryResult<OneMacUser, unknown> = {
  data: testStateCognitoUser,
  error: null,
  isError: false,
  isLoading: false,
  isLoadingError: false,
  isRefetchError: false,
  isSuccess: true,
  status: "success",
  dataUpdatedAt: Date.now(),
  errorUpdatedAt: 0,
  failureCount: 0,
  failureReason: null,
  errorUpdateCount: 0,
  fetchStatus: "idle",
  isInitialLoading: false,
  isPaused: false,
  isPlaceholderData: false,
  isPreviousData: false,
  isRefetching: false,
  isStale: false,
  isFetched: true,
  isFetchedAfterMount: true,
  isFetching: false,
  refetch: vi.fn(),
  remove: vi.fn(),
};

// Add logged out mock response
const mockLoggedOutResponse: UseQueryResult<OneMacUser, unknown> = {
  ...mockUserResponse,
  data: {
    user: null,
    isCms: false,
  },
};

// Mock the API module
vi.mock("@/api", () => ({
  useGetUser: vi.fn(() => mockUserResponse),
  getUser: vi.fn().mockResolvedValue({ user: null }),
}));

// Mock Auth
vi.mock("aws-amplify", () => ({
  Auth: {
    signOut: vi.fn(),
  },
}));

// Add navigation mock
const mockNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual<typeof import("react-router-dom")>(
    "react-router-dom",
  );
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
});

const routes = [
  {
    path: "/",
    element: <Layout />,
    children: [
      {
        index: true,
        element: <div>Welcome</div>,
      },
      {
        path: "profile",
        element: <div>Profile Page</div>,
      },
    ],
  },
];

const router = createMemoryRouter(routes, {
  initialEntries: ["/"],
  initialIndex: 0,
});

const renderWithProviders = () => {
  return render(
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>,
  );
};

beforeAll(() => {
  // Mock window.matchMedia
  window.matchMedia = vi.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  }));
});

describe("Layout", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders without errors", () => {
    const { getByTestId } = renderWithProviders();
    const layout = getByTestId("nav-banner-d");
    expect(layout).toBeInTheDocument();
  });

  describe("UserDropdownMenu", () => {
    beforeEach(() => {
      vi.mocked(useGetUser).mockReturnValue(mockUserResponse);

      // Mock window.matchMedia for desktop view by default
      window.matchMedia = vi.fn().mockImplementation((query) => ({
        matches: query === "(min-width: 768px)",
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      }));
    });

    it("renders UserDropdownMenu for logged-in user in desktop view", async () => {
      renderWithProviders();

      const myAccountButton = screen.getByText("My Account");
      expect(myAccountButton).toBeInTheDocument();

      await userEvent.click(myAccountButton);

      expect(screen.getByText("View Profile")).toBeInTheDocument();
      expect(screen.getByText("Sign Out")).toBeInTheDocument();
    });

    it("renders UserDropdownMenu for logged-in user in mobile view", async () => {
      // Override matchMedia for mobile view
      window.matchMedia = vi.fn().mockImplementation((query) => ({
        matches: query !== "(min-width: 768px)",
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      }));

      renderWithProviders();

      // Click hamburger menu first
      const menuButton = screen.getByRole("button");
      await userEvent.click(menuButton);

      const myAccountButton = screen.getByText("My Account");
      expect(myAccountButton).toBeInTheDocument();

      await userEvent.click(myAccountButton);

      expect(screen.getByText("View Profile")).toBeInTheDocument();
      expect(screen.getByText("Sign Out")).toBeInTheDocument();
    });
  });

  describe("UserDropdownMenu actions", () => {
    beforeEach(() => {
      vi.mocked(useGetUser).mockReturnValue(mockUserResponse);
      mockNavigate.mockClear();
      window.matchMedia = vi.fn().mockImplementation((query) => ({
        matches: query === "(min-width: 768px)",
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      }));
    });

    it("navigates to profile page when View Profile is clicked", async () => {
      renderWithProviders();

      const myAccountButton = screen.getByText("My Account");
      await userEvent.click(myAccountButton);

      const viewProfileButton = screen.getByText("View Profile");
      await userEvent.click(viewProfileButton);

      // Check if navigation was called with correct path
      expect(mockNavigate).toHaveBeenCalledWith("/profile");
    });

    it("calls Auth.signOut when Sign Out is clicked", async () => {
      renderWithProviders();

      // Open dropdown menu
      const myAccountButton = screen.getByText("My Account");
      await userEvent.click(myAccountButton);

      // Click Sign Out
      const signOutButton = screen.getByText("Sign Out");
      await userEvent.click(signOutButton);

      // Verify Auth.signOut was called
      expect(Auth.signOut).toHaveBeenCalled();
    });
  });

  describe("Navigation for logged-out users", () => {
    beforeEach(() => {
      vi.mocked(useGetUser).mockReturnValue(mockLoggedOutResponse);
      mockNavigate.mockClear();
    });

    it("renders Sign In and Register buttons in desktop view", () => {
      // Mock desktop view
      window.matchMedia = vi.fn().mockImplementation((query) => ({
        matches: query === "(min-width: 768px)",
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      }));

      renderWithProviders();

      expect(screen.getByTestId("sign-in-button-d")).toBeInTheDocument();
      expect(screen.getByTestId("register-button-d")).toBeInTheDocument();
      expect(screen.queryByText("My Account")).not.toBeInTheDocument();
    });

    it("renders Sign In and Register buttons in mobile view", async () => {
      // Mock mobile view
      window.matchMedia = vi.fn().mockImplementation((query) => ({
        matches: query !== "(min-width: 768px)",
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      }));

      renderWithProviders();

      // Click hamburger menu
      const menuButton = screen.getByRole("button");
      await userEvent.click(menuButton);

      expect(screen.getByText("Sign In")).toBeInTheDocument();
      expect(screen.getByText("Register")).toBeInTheDocument();
      expect(screen.queryByText("My Account")).not.toBeInTheDocument();
    });
  });
});
