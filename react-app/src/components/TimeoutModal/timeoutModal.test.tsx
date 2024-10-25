import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi, describe, it, expect, beforeEach, afterEach } from "vitest";
import { TimeoutModal } from ".";

const ParentComponent = () => (
  <div>
    <TimeoutModal />
    <div>
      <h1>Parent Component</h1>
    </div>
  </div>
);

beforeEach(() => {
  vi.useFakeTimers({ shouldAdvanceTime: true });
  vi.mock("@/api", () => ({
    useGetUser: vi
      .fn()
      .mockReturnValue({ data: { user: { name: "reviewer" }, isCms: true } }),
  }));
  vi.mock("@/hooks", () => ({
    useIdle: vi.fn().mockReturnValueOnce(true),
    useCountdown: vi.fn().mockReturnValue([
      200,
      {
        startCountdown: vi.fn(),
        stopCountdown: vi.fn(),
        resetCountdown: vi.fn(),
      },
    ]),
  }));
});

afterEach(() => {
  vi.useRealTimers();
  vi.clearAllMocks();
});

describe("Timeout Modal", () => {
  // it("doesn't display a modal before 20 minutes", () => {
  // vi.mock("@/hooks", () => ({
  //   useIdle: vi.fn().mockReturnValue(false),
  //   useCountdown: vi.fn().mockReturnValue([
  //     200000,
  //     {
  //       startCountdown: vi.fn(),
  //       stopCountdown: vi.fn(),
  //       resetCountdown: vi.fn(),
  //     },
  //   ]),
  // }));
  // const { queryByText } = render(<ParentComponent />);
  // // vi.advanceTimersByTime(1000);
  // const sessionExpirationWarning = queryByText(/Session expiring soon/i);
  // expect(sessionExpirationWarning).not.toBeInTheDocument();
  // });

  it("displays a modal after idle", async () => {
    render(<ParentComponent />);

    const sessionExpirationWarning = screen.getByText(
      /Your session will expire in/i,
    );
    expect(sessionExpirationWarning).toBeInTheDocument();

    const extendBtn = screen.getByText(/Yes, extend session/i);
    expect(extendBtn).toBeInTheDocument();

    await userEvent.click(extendBtn);
    await waitFor(() => {
      expect(
        screen.queryByText(/Your session will expire in/i),
      ).not.toBeInTheDocument();
    });
  });
});
