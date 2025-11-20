import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Auth } from "aws-amplify";
import { AUTH_CONFIG, noRoleUser, setMockUsername, testStateSubmitter } from "mocks";
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

import * as api from "@/api";
import config from "@/config";
import * as hooks from "@/hooks";
import * as ReactGAModule from "@/utils/ReactGA/SendGAEvent";
import { renderWithQueryClientAndMemoryRouter } from "@/utils/test-helpers";

import { Layout, SubNavHeader } from "./index";

vi.mock("@/utils/ReactGA/SendGAEvent", () => ({
  sendGAEvent: vi.fn(),
}));

/**
 * Mock Configurations
 * -------------------
 */

// Component mocks
vi.mock("../UsaBanner", () => ({ UsaBanner: () => null }));
vi.mock("../Footer", () => ({ Footer: () => <div data-testid="mock-footer"></div> }));
vi.mock("@/components", () => ({
  Layout: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="mocked-layout">{children}</div>
  ),
  SimplePageContainer: ({ children }: { children: React.ReactNode }) => children,
  UserPrompt: () => null,
  Banner: () => null,
  ScrollToTop: () => null,
  Accordion: () => null,
  AccordionItem: () => null,
  AccordionTrigger: () => null,
  AccordionContent: () => null,
  BreadCrumbs: () => <div data-testid="mock-breadcrumbs"></div>,
}));

// Navigation mock
const mockNavigate = vi.fn();
vi.mock("react-router", async () => {
  const actual = await vi.importActual<typeof import("react-router")>("react-router");
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

  await renderWithQueryClientAndMemoryRouter(
    <Layout />,
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
    await user.click(screen.getByTestId("mobile-menu-button"));
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

      expect(screen.getByText("Manage Profile")).toBeInTheDocument();
      expect(screen.getByText("Log Out")).toBeInTheDocument();
    });
  });

  describe("UserDropdownMenu actions", () => {
    beforeEach(() => {
      mockNavigate.mockClear();
      mockMediaQuery(VIEW_MODES.DESKTOP);
    });

    it("navigates to profile page when Manage Profile is clicked", async () => {
      const user = userEvent.setup();
      await setupUserDropdownTest();

      await user.click(screen.getByText("Manage Profile"));
      expect(mockNavigate).toHaveBeenCalledWith("/profile");
    });

    it("calls Auth.signOut when Log Out is clicked", async () => {
      const spy = vi.spyOn(Auth, "signOut");

      const user = userEvent.setup();
      await setupUserDropdownTest();

      await user.click(screen.getByText("Log Out"));
      expect(spy).toHaveBeenCalled();
    });
  });

  describe("Navigation for logged-in users", () => {
    it("navigates to dashboard if user has appropriate roles", async () => {
      const setupLayoutTest = async (
        viewMode: ViewMode = VIEW_MODES.DESKTOP,
        userData = testStateSubmitter,
      ) => {
        setMockUsername(userData);
        mockMediaQuery(viewMode);
        await renderLayout();
      };
      await setupLayoutTest(VIEW_MODES.DESKTOP);
      expect(screen.getByText("Dashboard")).toBeInTheDocument();
    });

    it("navigates to home page if user doesn't have appropriate roles", async () => {
      const setupLayoutTest = async (
        viewMode: ViewMode = VIEW_MODES.DESKTOP,
        userData = noRoleUser,
      ) => {
        setMockUsername(userData);
        mockMediaQuery(viewMode);
        await renderLayout();
      };
      await setupLayoutTest(VIEW_MODES.DESKTOP);
      expect(screen.queryByText("Dashboard")).not.toBeInTheDocument();
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

      const signInButton = screen.queryByText("Sign In") ?? screen.queryByText("Log In");

      expect(signInButton).toBeInTheDocument();
      expect(screen.getByText("Register")).toBeInTheDocument();
      expect(screen.queryByText("My Account")).not.toBeInTheDocument();
    });
  });

  describe("Navigation links and mobile view", () => {
    const setupLayoutTest = async (
      viewMode: ViewMode = VIEW_MODES.DESKTOP,
      userData = testStateSubmitter,
    ) => {
      setMockUsername(userData);
      mockMediaQuery(viewMode);
      await renderLayout();
    };

    it("renders nav links for authenticated user in desktop view", async () => {
      await setupLayoutTest(VIEW_MODES.DESKTOP);
      expect(screen.getByText("Home")).toBeInTheDocument();
      expect(screen.getByText("Dashboard")).toBeInTheDocument();
      expect(screen.getByText("View FAQs")).toBeInTheDocument();
      expect(screen.queryByText("Webforms")).not.toBeInTheDocument();
      expect(screen.queryByText("Sign In")).not.toBeInTheDocument();
      expect(screen.queryByText("Log In")).not.toBeInTheDocument();
      expect(screen.queryByText("Register")).not.toBeInTheDocument();
    });

    it("renders nav links for unauthenticated user in desktop view", async () => {
      await setupLayoutTest(VIEW_MODES.DESKTOP, null);
      expect(screen.getByText("Home")).toBeInTheDocument();
      expect(screen.getByText("View FAQs")).toBeInTheDocument();
      expect(screen.queryByText("Dashboard")).not.toBeInTheDocument();
      expect(screen.queryByText("Webforms")).not.toBeInTheDocument();
    });

    it("toggles the mobile menu for authenticaed users when the button is clicked", async () => {
      const user = userEvent.setup();
      await setupLayoutTest(VIEW_MODES.MOBILE);

      expect(screen.queryByText("Home")).not.toBeInTheDocument();

      // Open the menu
      const menuButton = screen.getByTestId("mobile-menu-button");
      await user.click(menuButton);

      expect(screen.getByText("Home")).toBeInTheDocument();
      expect(screen.getByText("Dashboard")).toBeInTheDocument();
      expect(screen.getByText("View FAQs")).toBeInTheDocument();
      expect(screen.queryByText("Webforms")).not.toBeInTheDocument();

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
      expect(screen.queryByTestId("mobile-menu-button")).toBeInTheDocument();
      await user.click(screen.queryByTestId("mobile-menu-button"));
      expect(screen.getByText("Home")).toBeVisible();
    });

    it("does not show mobile menu when in desktop view", async () => {
      vi.spyOn(hooks, "useMediaQuery").mockReturnValue(true);

      await renderLayout();

      // Mobile menu button should not be present
      expect(screen.queryByTestId("mobile-menu-button")).not.toBeInTheDocument();

      // Desktop menu items should be visible
      waitFor(() => expect(screen.getByText("Home")).toBeVisible());
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
      const signInButton = screen.queryByText("Sign In") ?? screen.queryByText("Log In");
      expect(signInButton).toBeInTheDocument();
      await user.click(signInButton);

      // Construct the expected URL
      const expectedUrl = `https://${AUTH_CONFIG.oauth.domain}/oauth2/authorize?redirect_uri=${AUTH_CONFIG.oauth.redirectSignIn}&response_type=${AUTH_CONFIG.oauth.responseType}&client_id=${AUTH_CONFIG.userPoolWebClientId}`;

      // Assert that window.location.assign was called with the expected URL
      expect(window.location.assign).toHaveBeenCalledWith(expectedUrl);

      // Restore original window.location
      // @ts-ignore we need to reset the original window function
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
      expect(window.location.assign).toBeCalledWith(config.idm.home_url);

      // Restore original window.location
      // @ts-ignore we need to reset the original window function
      window.location = originalLocation;
    });
  });

  describe("Layout Error Handling", () => {
    const FaultyChildComponent = () => {
      throw new Error("This is a simulated render error!");
    };

    let consoleErrorSpy: ReturnType<typeof vi.spyOn>;

    beforeEach(() => {
      vi.clearAllMocks();
      consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    });

    afterAll(() => {
      if (consoleErrorSpy) {
        consoleErrorSpy.mockRestore();
      }
    });

    it("should render ErrorPage within Layout when a child component throws an error", async () => {
      const testRoutes = [
        {
          path: "/",
          element: <Layout />,
          errorElement: <Layout />,
          children: [
            {
              index: true,
              element: <FaultyChildComponent />,
            },
            {
              path: "working",
              element: <div>This page works</div>,
            },
          ],
        },
      ];

      renderWithQueryClientAndMemoryRouter(undefined, testRoutes, { initialEntries: ["/"] });

      await waitFor(() => {
        expect(screen.getByText("Sorry, we couldn't find that page.")).toBeInTheDocument();
      });

      expect(screen.getByTestId("mock-footer")).toBeInTheDocument();
      expect(screen.getByTestId("nav-banner-d")).toBeInTheDocument();

      expect(screen.queryByText("This page works")).not.toBeInTheDocument();

      expect(consoleErrorSpy).toHaveBeenCalled();
    });

    it("should render normally when no error occurs in child", async () => {
      const testRoutes = [
        {
          path: "/",
          element: <Layout />,
          errorElement: <Layout />,
          children: [
            {
              index: true,
              element: <div data-testid="welcome-content">Welcome Page Content</div>,
            },
          ],
        },
      ];

      renderWithQueryClientAndMemoryRouter(undefined, testRoutes, { initialEntries: ["/"] });

      const welcomeContent = await screen.findByTestId("welcome-content");
      expect(welcomeContent).toBeInTheDocument();
      expect(welcomeContent).toHaveTextContent("Welcome Page Content");

      expect(screen.queryByText("Sorry, we couldn't find that page.")).not.toBeInTheDocument();

      expect(consoleErrorSpy).not.toHaveBeenCalled();
    });
  });

  describe("SubNavHeader", () => {
    it("should render with the bg-sky-100 class", () => {
      render(<SubNavHeader>Test Content</SubNavHeader>);

      const subNavHeaderDiv = screen.getByTestId("sub-nav-header");
      expect(subNavHeaderDiv).toHaveClass("bg-sky-100");
    });
  });

  describe("GA Event Tracking", () => {
    it("fires GA event when a nav link is clicked in desktop view", async () => {
      const user = userEvent.setup();
      mockMediaQuery({ desktop: true, mobile: false });
      await renderLayout();

      const homeLink = await screen.findByText("Home");
      await user.click(homeLink);

      expect(ReactGAModule.sendGAEvent).toHaveBeenCalledWith(
        "home_nav_home",
        expect.objectContaining({
          event_category: "Navigation",
          event_label: "Home",
        }),
      );
    });

    it("fires GA event when a nav link is clicked in mobile view", async () => {
      const user = userEvent.setup();

      mockMediaQuery(VIEW_MODES.MOBILE);
      await renderLayout();

      const homeLink = await screen.findByText("Home");
      await user.click(homeLink);

      expect(ReactGAModule.sendGAEvent).toHaveBeenCalledWith(
        "home_nav_home",
        expect.objectContaining({
          event_category: "Navigation",
          event_label: "Home",
        }),
      );
    });
  });
});
