import {
  describe,
  it,
  expect,
  beforeAll,
  beforeEach,
  afterEach,
  vi,
} from "vitest";
import { Layout, SubNavHeader } from "./index";
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
import * as hooks from "@/hooks";

/**
 * Mock Configurations
 * -------------------
 */

// Component mocks
vi.mock("../UsaBanner", () => ({ UsaBanner: () => null }));
vi.mock("../Footer", () => ({ Footer: () => null }));
vi.mock("@/components", () => ({
  SimplePageContainer: ({ children }: { children: React.ReactNode }) =>
    children,
  UserPrompt: () => null,
  Banner: () => null,
}));

// API and Auth mocks
vi.mock("@/api", () => ({
  useGetUser: vi.fn(() => mockUserResponse),
  getUser: vi.fn().mockResolvedValue({ user: null }),
}));

vi.mock("aws-amplify", () => ({
  Auth: { signOut: vi.fn(), configure: vi.fn() },
}));

// Navigation mock
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

// Mock for ResizeObserver (used by radix-ui)
class ResizeObserverMock {
  observe() {}
  unobserve() {}
  disconnect() {}
}
global.ResizeObserver = ResizeObserverMock;

/**
 * Test Data
 * ---------
 */

// Base query result for all user responses
const baseQueryResult: Partial<UseQueryResult> = {
  error: null,
  isError: false,
  isLoading: false,
  status: "success",
  fetchStatus: "idle",
  isSuccess: true,
};

// User response mocks
const mockUserResponse: UseQueryResult<OneMacUser, unknown> = {
  ...baseQueryResult,
  data: testStateCognitoUser,
} as UseQueryResult<OneMacUser, unknown>;

const mockLoggedOutResponse: UseQueryResult<OneMacUser, unknown> = {
  ...baseQueryResult,
  data: { user: null, isCms: false },
} as UseQueryResult<OneMacUser, unknown>;

/**
 * View Mode Configuration
 * ----------------------
 */

const VIEW_MODES = {
  DESKTOP: { desktop: true, mobile: false },
  MOBILE: { desktop: false, mobile: true },
} as const;

type ViewMode = (typeof VIEW_MODES)[keyof typeof VIEW_MODES];

// Helper to configure media query mocks based on view mode
const mockMediaQuery = (viewMode: ViewMode) => {
  window.matchMedia = vi.fn().mockImplementation((query) => ({
    matches:
      query === "(min-width: 768px)" ? viewMode.desktop : viewMode.mobile,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  }));
};

/**
 * Test Setup Helpers
 * ------------------
 */

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false } },
});

// Router setup with basic routes
const createTestRouter = () =>
  createMemoryRouter(
    [
      {
        path: "/",
        element: <Layout />,
        children: [
          { index: true, element: <div>Welcome</div> },
          { path: "profile", element: <div>Profile Page</div> },
        ],
      },
    ],
    { initialEntries: ["/"], initialIndex: 0 },
  );

// Render helper with all required providers
const renderWithProviders = () => {
  return render(
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={createTestRouter()} />
    </QueryClientProvider>,
  );
};

// Test setup helpers
const setupTest = (viewMode: ViewMode = VIEW_MODES.DESKTOP) => {
  mockMediaQuery(viewMode);
  return renderWithProviders();
};

const setupUserDropdownTest = async (
  viewMode: ViewMode = VIEW_MODES.DESKTOP,
) => {
  setupTest(viewMode);

  if (!viewMode.desktop) {
    await userEvent.click(screen.getByRole("button"));
  }

  const myAccountButton = screen.getByText("My Account");
  await userEvent.click(myAccountButton);

  return { myAccountButton };
};

/**
 * Tests
 * -----
 */

beforeAll(() => {
  // Mock window.matchMedia
  Object.defineProperty(window, "matchMedia", {
    writable: true,
    value: vi.fn().mockImplementation((query) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });
});

describe("Layout", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("renders without errors", () => {
    const { getByTestId } = renderWithProviders();
    const layout = getByTestId("nav-banner-d");
    expect(layout).toBeInTheDocument();
  });

  describe("UserDropdownMenu", () => {
    beforeEach(() => {
      vi.mocked(useGetUser).mockReturnValue(mockUserResponse);
    });

    it.each([
      ["desktop", VIEW_MODES.DESKTOP],
      ["mobile", VIEW_MODES.MOBILE],
    ])(
      "renders UserDropdownMenu for logged-in user in %s view",
      async (_, viewMode) => {
        await setupUserDropdownTest(viewMode);

        expect(screen.getByText("View Profile")).toBeInTheDocument();
        expect(screen.getByText("Sign Out")).toBeInTheDocument();
      },
    );
  });

  describe("UserDropdownMenu actions", () => {
    beforeEach(() => {
      vi.mocked(useGetUser).mockReturnValue(mockUserResponse);
      mockNavigate.mockClear();
      mockMediaQuery(VIEW_MODES.DESKTOP);
    });

    it("navigates to profile page when View Profile is clicked", async () => {
      await setupUserDropdownTest();
      await userEvent.click(screen.getByText("View Profile"));
      expect(mockNavigate).toHaveBeenCalledWith("/profile");
    });

    it("calls Auth.signOut when Sign Out is clicked", async () => {
      await setupUserDropdownTest();
      await userEvent.click(screen.getByText("Sign Out"));
      expect(Auth.signOut).toHaveBeenCalled();
    });
  });

  describe("Navigation for logged-out users", () => {
    beforeEach(() => {
      vi.mocked(useGetUser).mockReturnValue(mockLoggedOutResponse);
      mockNavigate.mockClear();
    });

    it.each([
      ["desktop", VIEW_MODES.DESKTOP],
      ["mobile", VIEW_MODES.MOBILE],
    ])(
      "renders Sign In and Register buttons in %s view",
      async (_, viewMode) => {
        setupTest(viewMode);

        if (!viewMode.desktop) {
          await userEvent.click(screen.getByRole("button"));
        }

        expect(screen.getByText("Sign In")).toBeInTheDocument();
        expect(screen.getByText("Register")).toBeInTheDocument();
        expect(screen.queryByText("My Account")).not.toBeInTheDocument();
      },
    );
  });

  describe("Navigation links and mobile view", () => {
    const setupLayoutTest = (
      viewMode: ViewMode = VIEW_MODES.DESKTOP,
      userData = mockUserResponse,
    ) => {
      vi.mocked(useGetUser).mockReturnValue(userData);
      mockMediaQuery(viewMode);
      return renderWithProviders();
    };

    it("renders nav links for authenticated user in desktop view", async () => {
      setupLayoutTest(VIEW_MODES.DESKTOP);
      expect(screen.getByText("Home")).toBeInTheDocument();
      expect(screen.getByText("Dashboard")).toBeInTheDocument();
      expect(screen.getByText("FAQ")).toBeInTheDocument();
      expect(screen.getByText("Webforms")).toBeInTheDocument();
      expect(screen.queryByText("Sign In")).not.toBeInTheDocument();
      expect(screen.queryByText("Register")).not.toBeInTheDocument();
    });

    it("renders nav links for unauthenticated user in desktop view", async () => {
      setupLayoutTest(VIEW_MODES.DESKTOP, mockLoggedOutResponse);
      expect(screen.getByText("Home")).toBeInTheDocument();
      expect(screen.getByText("FAQ")).toBeInTheDocument();
      expect(screen.queryByText("Dashboard")).not.toBeInTheDocument();
      expect(screen.queryByText("Webforms")).not.toBeInTheDocument();
    });

    it("toggles the mobile menu for authenticaed users when the button is clicked", async () => {
      setupLayoutTest(VIEW_MODES.MOBILE);

      expect(screen.queryByText("Home")).not.toBeInTheDocument();

      // Open the menu
      const menuButton = screen.getByRole("button");
      await userEvent.click(menuButton);

      expect(screen.getByText("Home")).toBeInTheDocument();
      expect(screen.getByText("Dashboard")).toBeInTheDocument();
      expect(screen.getByText("FAQ")).toBeInTheDocument();
      expect(screen.getByText("Webforms")).toBeInTheDocument();

      // Close the menu
      await userEvent.click(menuButton);
      expect(screen.queryByText("Home")).not.toBeInTheDocument();
    });
  });

  describe("ResponsiveNav screen size changes", () => {
    beforeEach(() => {
      vi.clearAllMocks();
      vi.mocked(useGetUser).mockReturnValue(mockUserResponse);
    });

    it("shows mobile menu when in mobile view", async () => {
      vi.spyOn(hooks, "useMediaQuery").mockReturnValue(false);

      renderWithProviders();

      // Mobile menu button should be present
      expect(screen.getByTestId("mobile-menu-button")).toBeInTheDocument();

      // Open the mobile menu
      await userEvent.click(screen.queryByTestId("mobile-menu-button"));
      expect(screen.getByText("Home")).toBeVisible();
    });

    it("does not show mobile menu when in desktop view", () => {
      vi.spyOn(hooks, "useMediaQuery").mockReturnValue(true);

      renderWithProviders();

      // Mobile menu button should not be present
      expect(
        screen.queryByTestId("mobile-menu-button"),
      ).not.toBeInTheDocument();

      // Desktop menu items should be visible
      expect(screen.getByText("Home")).toBeVisible();
    });
  });

  describe("ResponsiveNav login action", () => {
    beforeEach(() => {
      vi.mocked(useGetUser).mockReturnValue(mockLoggedOutResponse);
      mockMediaQuery(VIEW_MODES.DESKTOP);
    });

    it("redirect to login URL when Sign In is clicked", async () => {
      // Mock Auth.configure
      const authConfigMock = {
        oauth: {
          domain: "test-domain",
          redirectSignIn: "http://localhost/",
          redirectSignOut: "http://localhost/",
          responseType: "code",
          scope: [],
        },
        userPoolWebClientId: "test-client-id",
      };
      vi.spyOn(Auth, "configure").mockReturnValue(authConfigMock);

      // Mock window.location.assign
      const originalLocation = window.location;
      delete (window as any).location;
      window.location = { assign: vi.fn() } as any;

      // Render the component
      renderWithProviders();

      // Click the "Sign In" button
      const signInButton = screen.getByText("Sign In");
      await userEvent.click(signInButton);

      // Construct the expected URL
      const expectedUrl = `https://${authConfigMock.oauth.domain}/oauth2/authorize?redirect_uri=${authConfigMock.oauth.redirectSignIn}&response_type=${authConfigMock.oauth.responseType}&client_id=${authConfigMock.userPoolWebClientId}`;

      // Assert that window.location.assign was called with the expected URL
      expect(window.location.assign).toHaveBeenCalledWith(expectedUrl);

      // Restore original window.location
      window.location = originalLocation;
    });

    it("should redirect to the login URL when Register is clicked", async () => {
      const expectedUrl = "https://test.home.idm.cms.gov/signin/login.html"; // Adjusted URL

      // Mock window.location.assign
      const originalLocation = window.location;
      delete (window as any).location;
      window.location = { assign: vi.fn() } as any;

      // Render the component
      renderWithProviders();

      // Click the "Register" button
      const registerButton = screen.getByText("Register");
      await userEvent.click(registerButton);

      // Assert that window.location.assign was called with the expected URL
      expect(window.location.assign).toHaveBeenCalledWith(expectedUrl);

      // Restore original window.location
      window.location = originalLocation;
    });
  });

  describe("SubNavHeader", () => {
    it("should render with the bg-sky-100 class", () => {
      render(<SubNavHeader>Test Content</SubNavHeader>);

      const subNavHeaderDiv = screen.getByTestId("sub-nav-header");
      expect(subNavHeaderDiv).toHaveClass("bg-sky-100");
    });
  });
});
