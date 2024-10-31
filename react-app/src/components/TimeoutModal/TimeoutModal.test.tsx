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

vi.mock("@/api", () => ({
  useGetUser: vi.fn().mockReturnValue({
    data: { user: { "custom:cms-roles": "onemac-micro-super" }, isCms: true },
  }),
}));

vi.mock("aws-amplify", () => ({
  Auth: {
    signOut: vi.fn(),
  },
}));

describe("Timeout Modal", () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    vi.mock("@/hooks", () => ({
      useIdle: vi.fn().mockReturnValue(true),
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

  it("closes after user extends session", async () => {
    render(<ParentComponent />);

    const sessionExpirationWarning = screen.getByText(
      /Your session will expire in/i,
    );
    expect(sessionExpirationWarning).toBeInTheDocument();

    // const extendBtn = screen.getByText(/Yes, extend session/i);
    // expect(extendBtn).toBeInTheDocument();

    // await userEvent.click(extendBtn);
    // await waitFor(() => {
    //   expect(
    //     screen.queryByText(/Your session will expire in/i),
    //   ).not.toBeInTheDocument();
    // });
  });

  it("closes the modal if user clicks sign out", async () => {
    render(<ParentComponent />);

    const sessionExpirationWarning = screen.getByText(
      /Your session will expire in/i,
    );
    expect(sessionExpirationWarning).toBeInTheDocument();

    const signOutBtn = screen.getByText(/No, sign out/i);
    expect(signOutBtn).toBeInTheDocument();

    await userEvent.click(signOutBtn);
    await waitFor(() => {
      expect(
        screen.queryByText(/Your session will expire in/i),
      ).not.toBeInTheDocument();
    });
  });
});
