import { describe, it, expect, beforeAll, beforeEach, vi } from "vitest";
import { Layout, SubNavHeader } from "./index";
import { screen, render, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Auth } from "aws-amplify";
import * as hooks from "@/hooks";
import * as api from "@/api";
import { renderWithQueryClient } from "@/utils/test-helpers/renderForm";
import { setMockUsername, makoStateSubmitter, AUTH_CONFIG } from "mocks";

/**
 * Mock Configurations
 * -------------------
 */

// Component mocks
vi.mock("../UsaBanner", () => ({ UsaBanner: () => null }));
vi.mock("../Footer", () => ({ Footer: () => null }));
vi.mock("@/components", () => ({
  SimplePageContainer: ({ children }: { children: React.ReactNode }) => children,
  UserPrompt: () => null,
  Banner: () => null,
  ScrollToTop: () => null,
}));

// Navigation mock
const mockNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual<typeof import("react-router-dom")>("react-router-dom");
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
    matches: query === "(min-width: 768px)" ? viewMode.desktop : viewMode.mobile,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  }));
};

const renderLayout = async () => {
  const getUserSpy = vi.spyOn(api, "useGetUser");

  await renderWithQueryClient(<Layout />, {
    routes: [
      {
        path: "/",
        element: <Layout />,
        children: [
          { index: true, element: <div>Welcome</div> },
          { path: "profile", element: <div>Profile Page</div> },
        ],
      },
    ],
    options: { initialEntries: ["/"], initialIndex: 0 },
  });

  await waitFor(() =>
    expect(getUserSpy).toHaveLastReturnedWith(
      expect.objectContaining({
        isLoading: false,
      }),
    ),
  );
};

// Test setup helpers
const setupTest = async (viewMode: ViewMode = VIEW_MODES.DESKTOP) => {
  mockMediaQuery(viewMode);
  return renderLayout();
};

const setupUserDropdownTest = async (viewMode: ViewMode = VIEW_MODES.DESKTOP) => {
  const user = userEvent.setup();
  await setupTest(viewMode);

  if (!viewMode.desktop) {
    await user.click(screen.getByRole("button"));
  }

  const myAccountButton = screen.getByText("My Account");
  await user.click(myAccountButton);

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

  it("renders without errors", async () => {
    await renderLayout();
    const layout = screen.getByTestId("nav-banner-d");
    expect(layout).toBeInTheDocument();
  });

  describe("UserDropdownMenu", () => {
    it.each([
      ["desktop", VIEW_MODES.DESKTOP],
      ["mobile", VIEW_MODES.MOBILE],
    ])("renders UserDropdownMenu for logged-in user in %s view", async (_, viewMode) => {
      await setupUserDropdownTest(viewMode as ViewMode);

      expect(screen.getByText("View Profile")).toBeInTheDocument();
      expect(screen.getByText("Sign Out")).toBeInTheDocument();
    });
  });

  describe("UserDropdownMenu actions", () => {
    beforeEach(() => {
      mockNavigate.mockClear();
      mockMediaQuery(VIEW_MODES.DESKTOP);
    });

    it("navigates to profile page when View Profile is clicked", async () => {
      const user = userEvent.setup();
      await setupUserDropdownTest();

      await user.click(screen.getByText("View Profile"));
      expect(mockNavigate).toHaveBeenCalledWith("/profile");
    });

    it("calls Auth.signOut when Sign Out is clicked", async () => {
      const spy = vi.spyOn(Auth, "signOut");

      const user = userEvent.setup();
      await setupUserDropdownTest();

      await user.click(screen.getByText("Sign Out"));
      expect(spy).toHaveBeenCalled();
    });
  });

  describe("Navigation for logged-out users", () => {
    beforeEach(() => {
      setMockUsername(null);
      mockNavigate.mockClear();
    });

    it.each([
      ["desktop", VIEW_MODES.DESKTOP],
      ["mobile", VIEW_MODES.MOBILE],
    ])("renders Sign In and Register buttons in %s view", async (_, viewMode) => {
      const user = userEvent.setup();
      await setupTest(viewMode);

      if (!viewMode.desktop) {
        await user.click(screen.getByRole("button"));
      }

      expect(screen.getByText("Sign In")).toBeInTheDocument();
      expect(screen.getByText("Register")).toBeInTheDocument();
      expect(screen.queryByText("My Account")).not.toBeInTheDocument();
    });
  });

  describe("Navigation links and mobile view", () => {
    const setupLayoutTest = async (
      viewMode: ViewMode = VIEW_MODES.DESKTOP,
      userData = makoStateSubmitter,
    ) => {
      setMockUsername(userData);
      mockMediaQuery(viewMode);
      await renderLayout();
    };

    it("renders nav links for authenticated user in desktop view", async () => {
      await setupLayoutTest(VIEW_MODES.DESKTOP);
      expect(screen.getByText("Home")).toBeInTheDocument();
      expect(screen.getByText("Dashboard")).toBeInTheDocument();
      expect(screen.getByText("FAQ")).toBeInTheDocument();
      expect(screen.getByText("Webforms")).toBeInTheDocument();
      expect(screen.queryByText("Sign In")).not.toBeInTheDocument();
      expect(screen.queryByText("Register")).not.toBeInTheDocument();
    });

    it("renders nav links for unauthenticated user in desktop view", async () => {
      await setupLayoutTest(VIEW_MODES.DESKTOP, null);
      expect(screen.getByText("Home")).toBeInTheDocument();
      expect(screen.getByText("FAQ")).toBeInTheDocument();
      expect(screen.queryByText("Dashboard")).not.toBeInTheDocument();
      expect(screen.queryByText("Webforms")).not.toBeInTheDocument();
    });

    it("toggles the mobile menu for authenticaed users when the button is clicked", async () => {
      const user = userEvent.setup();
      await setupLayoutTest(VIEW_MODES.MOBILE);

      expect(screen.queryByText("Home")).not.toBeInTheDocument();

      // Open the menu
      const menuButton = screen.getByRole("button");
      await user.click(menuButton);

      expect(screen.getByText("Home")).toBeInTheDocument();
      expect(screen.getByText("Dashboard")).toBeInTheDocument();
      expect(screen.getByText("FAQ")).toBeInTheDocument();
      expect(screen.getByText("Webforms")).toBeInTheDocument();

      // Close the menu
      await user.click(menuButton);
      expect(screen.queryByText("Home")).not.toBeInTheDocument();
    });
  });

  describe("ResponsiveNav screen size changes", () => {
    it("shows mobile menu when in mobile view", async () => {
      vi.spyOn(hooks, "useMediaQuery").mockReturnValue(false);

      const user = userEvent.setup();
      await renderLayout();

      // Mobile menu button should be present
      expect(screen.getByTestId("mobile-menu-button")).toBeInTheDocument();

      // Open the mobile menu
      await user.click(screen.queryByTestId("mobile-menu-button"));
      expect(screen.getByText("Home")).toBeVisible();
    });

    it("does not show mobile menu when in desktop view", async () => {
      vi.spyOn(hooks, "useMediaQuery").mockReturnValue(true);

      await renderLayout();

      // Mobile menu button should not be present
      expect(screen.queryByTestId("mobile-menu-button")).not.toBeInTheDocument();

      // Desktop menu items should be visible
      expect(screen.getByText("Home")).toBeVisible();
    });
  });

  describe("ResponsiveNav login action", () => {
    beforeEach(() => {
      setMockUsername(null);
      mockMediaQuery(VIEW_MODES.DESKTOP);
    });

    it("redirect to login URL when Sign In is clicked", async () => {
      vi.spyOn(Auth, "configure").mockReturnValue(AUTH_CONFIG);

      // Mock window.location.assign
      const originalLocation = window.location;
      delete (window as any).location;
      window.location = { assign: vi.fn() } as any;

      // Render the component
      const user = userEvent.setup();
      await renderLayout();

      // Click the "Sign In" button
      const signInButton = screen.getByText("Sign In");
      await user.click(signInButton);

      // Construct the expected URL
      const expectedUrl = `https://${AUTH_CONFIG.oauth.domain}/oauth2/authorize?redirect_uri=${AUTH_CONFIG.oauth.redirectSignIn}&response_type=${AUTH_CONFIG.oauth.responseType}&client_id=${AUTH_CONFIG.userPoolWebClientId}`;

      // Assert that window.location.assign was called with the expected URL
      expect(window.location.assign).toHaveBeenCalledWith(expectedUrl);

      // Restore original window.location
      window.location = originalLocation;
    });

    it("should redirect to the login URL when Register is clicked", async () => {
      // Mock window.location.assign
      const originalLocation = window.location;
      delete (window as any).location;
      window.location = { assign: vi.fn() } as any;

      // Render the component
      const user = userEvent.setup();
      await renderLayout();

      // Click the "Register" button
      const registerButton = screen.getByText("Register");
      await user.click(registerButton);

      // Assert that window.location.assign was called with the expected URL
      expect(window.location.assign).toHaveBeenCalledWith(
        expect.stringContaining("/signin/login.html"),
      );

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
