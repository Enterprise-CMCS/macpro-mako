import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useEffect, useRef, useState } from "react";
import { BrowserRouter } from "react-router";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { MedSpaFooter } from "./index";
import { Footer } from "./index";

vi.mock("@/utils/ReactGA/SendGAEvent", () => ({
  sendGAEvent: vi.fn(),
}));

import { sendGAEvent } from "@/utils/ReactGA/SendGAEvent";

vi.mock("@/api", () => ({
  useGetUser: () => ({
    data: {
      user: {
        role: "statesubmitter",
        "custom:ismemberof": "ONEMAC_USER",
        "custom:cms-roles": "",
      },
    },
  }),
  useGetUserDetails: () => ({
    data: {
      role: "statesubmitter",
    },
  }),
}));

vi.mock("@/hooks/useFeatureFlag", () => ({
  useFeatureFlag: (flag: string) => flag === "STATE_HOMEPAGE_FLAG",
}));

vi.mock("shared-utils", () => ({
  isStateUser: () => true,
  isCmsUser: () => false,
}));

const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        cacheTime: 0,
      },
    },
  });

const renderWithProviders = (ui: React.ReactElement) =>
  render(
    <QueryClientProvider client={createTestQueryClient()}>
      <BrowserRouter>{ui}</BrowserRouter>
    </QueryClientProvider>,
  );

// === TESTS ===

describe("Footer", () => {
  it("renders email and address correctly", () => {
    renderWithProviders(
      <Footer
        email="testEmail@email.com"
        address={{
          city: "testCity",
          state: "testState",
          street: "testStreet",
          zip: 1234,
        }}
      />,
    );

    expect(screen.getByText("testEmail@email.com")).toBeInTheDocument();
    expect(screen.getByText("testCity, testState 1234")).toBeInTheDocument();
  });

  it("shows 'Latest Updates' link for state users with feature flag enabled", () => {
    renderWithProviders(
      <Footer
        email="stateuser@example.com"
        address={{
          city: "Baltimore",
          state: "MD",
          street: "7500 Security Blvd",
          zip: 21244,
        }}
      />,
    );

    const link = screen.getByRole("link", { name: /Latest Updates/i });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute("href", "/latestupdates");
  });

  it("does not show nav links if showNavLinks is false", () => {
    renderWithProviders(
      <Footer
        email="nonav@example.com"
        address={{
          city: "City",
          state: "ST",
          street: "123 Street",
          zip: 99999,
        }}
        showNavLinks={false}
      />,
    );

    expect(screen.queryByRole("link", { name: /Home/i })).not.toBeInTheDocument();
    expect(screen.queryByRole("link", { name: /Dashboard/i })).not.toBeInTheDocument();
    expect(screen.queryByRole("link", { name: /Latest Updates/i })).not.toBeInTheDocument();
    expect(screen.queryByRole("link", { name: /Support/i })).not.toBeInTheDocument();
  });
});

describe("FAQFooter", () => {
  it("renders when CHIP_SPA_SUBMISSION is false", async () => {
    vi.doMock("@/hooks/useFeatureFlag", () => ({
      useFeatureFlag: (flag: string) => flag !== "CHIP_SPA_SUBMISSION",
    }));

    const { FAQFooter } = await import("./index");
    renderWithProviders(<FAQFooter />);
    expect(screen.getByText("Do you have questions or need support?")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "View FAQs" })).toBeInTheDocument();
  });

  it("does not render when CHIP_SPA_SUBMISSION is true", async () => {
    vi.doMock("@/hooks/useFeatureFlag", () => ({
      useFeatureFlag: (flag: string) => flag === "CHIP_SPA_SUBMISSION",
    }));

    await vi.resetModules(); // Important: reset before import to apply the new mock

    const { FAQFooter } = await import("./index");
    renderWithProviders(<FAQFooter />);

    expect(screen.queryByText("Do you have questions or need support?")).not.toBeInTheDocument();
  });
});

describe("MedSpaFooter scroll behavior", () => {
  beforeEach(() => {
    // Reset scroll position before each test
    Object.defineProperty(window, "scrollY", {
      writable: true,
      configurable: true,
      value: 0,
    });
    vi.resetAllMocks();
  });

  it("hides footer when scrolled to bottom", () => {
    // Mock document height and window size
    Object.defineProperty(document.body, "offsetHeight", {
      configurable: true,
      value: 1000,
    });
    Object.defineProperty(window, "innerHeight", {
      configurable: true,
      value: 500,
    });
    window.scrollY = 500; // Simulate scrolling to the bottom

    const onCancel = vi.fn();
    const onSubmit = vi.fn();

    render(<MedSpaFooter onCancel={onCancel} onSubmit={onSubmit} disabled={true} />);

    // Trigger scroll event
    window.dispatchEvent(new Event("scroll"));

    // Footer should disappear
    expect(screen.queryByTestId("submit-action-form")).not.toBeInTheDocument();
  });

  it("shows footer when not scrolled to bottom", () => {
    Object.defineProperty(document.body, "offsetHeight", {
      configurable: true,
      value: 1000,
    });
    Object.defineProperty(window, "innerHeight", {
      configurable: true,
      value: 500,
    });
    window.scrollY = 200; // Not at the bottom

    const onCancel = vi.fn();
    const onSubmit = vi.fn();

    render(<MedSpaFooter onCancel={onCancel} onSubmit={onSubmit} disabled={true} />);

    window.dispatchEvent(new Event("scroll"));

    expect(screen.getByTestId("submit-action-form-footer")).toBeInTheDocument();
  });
});

// Mock component using the IntersectionObserver logic
const TestComponent = () => {
  const [visible, setVisible] = useState(true);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setVisible(!entry.isIntersecting);
      },
      { threshold: 0.1 },
    );

    const target = ref.current;
    if (target) observer.observe(target);

    return () => observer.disconnect();
  }, []);

  if (!visible) return null;

  return (
    <div data-testid="visible-div" ref={ref}>
      I am visible
    </div>
  );
};

describe("TestComponent visibility based on IntersectionObserver", () => {
  let observeMock: (target: Element) => void;
  let disconnectMock: () => void;

  beforeEach(() => {
    observeMock = vi.fn();
    disconnectMock = vi.fn();

    global.IntersectionObserver = vi.fn(function (this: any, cb: any) {
      this.observe = observeMock;
      this.disconnect = disconnectMock;
      this.trigger = (isIntersecting: boolean) => {
        cb([{ isIntersecting }]);
      };
    }) as unknown as typeof IntersectionObserver;
  });

  it("hides component when target is intersecting", async () => {
    render(<TestComponent />);

    // @ts-ignore
    const observerInstance = (IntersectionObserver as any).mock.instances[0];
    observerInstance.trigger(true); // simulate isIntersecting = true

    await waitFor(() => {
      expect(screen.queryByTestId("visible-div")).not.toBeInTheDocument();
    });
  });

  it("shows component when target is NOT intersecting", () => {
    render(<TestComponent />);

    // @ts-ignore
    const observerInstance = (IntersectionObserver as any).mock.instances[0];
    observerInstance.trigger(false); // simulate isIntersecting = false

    expect(screen.getByTestId("visible-div")).toBeInTheDocument();
  });
});

describe("MedSpaFooter", () => {
  it("disables Save & Submit button when form is invalid", () => {
    const onCancel = vi.fn();
    const onSubmit = vi.fn();

    render(
      <MedSpaFooter
        onCancel={onCancel}
        onSubmit={onSubmit}
        disabled={true} // <- form is invalid
      />,
    );

    const submitBtn = screen.getByTestId("submit-action-form-footer");
    expect(submitBtn).toBeDisabled();
  });

  it("enables Save & Submit button when form is valid", () => {
    const onCancel = vi.fn();
    const onSubmit = vi.fn();

    render(
      <MedSpaFooter
        onCancel={onCancel}
        onSubmit={onSubmit}
        disabled={false} // <- form is valid
      />,
    );

    const submitBtn = screen.getByTestId("submit-action-form-footer");
    expect(submitBtn).not.toBeDisabled();
  });
});

describe("Footer GA Events", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("sends GA event when 'Home' link is clicked", async () => {
    renderWithProviders(
      <Footer
        email="test@example.com"
        address={{ city: "City", state: "ST", street: "Street", zip: 12345 }}
      />,
    );

    await userEvent.click(screen.getByRole("link", { name: /Home/i }));

    expect(sendGAEvent).toHaveBeenCalledWith("home_footer_link", { link_name: "home" });
  });

  it("sends GA event when 'Dashboard' link is clicked", async () => {
    renderWithProviders(
      <Footer
        email="test@example.com"
        address={{ city: "City", state: "ST", street: "Street", zip: 12345 }}
      />,
    );

    await userEvent.click(screen.getByRole("link", { name: /Dashboard/i }));

    expect(sendGAEvent).toHaveBeenCalledWith("home_footer_link", { link_name: "dashboard" });
  });

  it("sends GA event when 'Latest Updates' link is clicked (state user)", async () => {
    renderWithProviders(
      <Footer
        email="test@example.com"
        address={{ city: "City", state: "ST", street: "Street", zip: 12345 }}
      />,
    );

    await userEvent.click(screen.getByRole("link", { name: /Latest Updates/i }));

    expect(sendGAEvent).toHaveBeenCalledWith("home_footer_link", { link_name: "latestupdates" });
  });

  it("sends GA event when 'Support' link is clicked", async () => {
    renderWithProviders(
      <Footer
        email="test@example.com"
        address={{ city: "City", state: "ST", street: "Street", zip: 12345 }}
      />,
    );

    await userEvent.click(screen.getByRole("link", { name: /Support/i }));

    expect(sendGAEvent).toHaveBeenCalledWith("home_footer_link", { link_name: "support" });
  });

  it("sends GA event when Help Desk phone link is clicked", async () => {
    renderWithProviders(
      <Footer
        email="test@example.com"
        address={{ city: "City", state: "ST", street: "Street", zip: 12345 }}
      />,
    );

    await userEvent.click(screen.getByRole("link", { name: /\(833\) 228-2540/i }));

    expect(sendGAEvent).toHaveBeenCalledWith("home_help_phone", null);
  });

  it("sends GA event when Help Desk email link is clicked", async () => {
    renderWithProviders(
      <Footer
        email="test@example.com"
        address={{ city: "City", state: "ST", street: "Street", zip: 12345 }}
      />,
    );

    await userEvent.click(screen.getByRole("link", { name: /OneMAC_Helpdesk@cms\.hhs\.gov/i }));

    expect(sendGAEvent).toHaveBeenCalledWith("home_help_email", null);
  });
});
