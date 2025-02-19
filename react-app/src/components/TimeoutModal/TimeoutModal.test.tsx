import { fireEvent, render, screen } from "@testing-library/react";
import { vi, describe, it, expect, beforeEach, afterEach } from "vitest";
import { TimeoutModal } from ".";
import * as api from "@/api";
import { mockUseGetUser, setDefaultStateSubmitter } from "mocks";
import { UseQueryResult } from "@tanstack/react-query";
import { OneMacUser } from "@/api";
import { Auth } from "aws-amplify";
import * as hooks from "@/hooks";

const mockTimer = 60;

const ParentComponent = () => (
  <div>
    <TimeoutModal />
    <div>
      <h1>Parent Component</h1>
    </div>
  </div>
);

describe("Timeout Modal", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.spyOn(api, "useGetUser").mockImplementation(() => {
      const response = mockUseGetUser();
      return response as UseQueryResult<OneMacUser, unknown>;
    });

    vi.spyOn(hooks, "useCountdown").mockReturnValue([
      mockTimer,
      { startCountdown: vi.fn(), stopCountdown: vi.fn(), resetCountdown: vi.fn() },
    ]);
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.resetAllMocks();
  });

  it("closes after user extends session", async () => {
    render(<ParentComponent />);

    await vi.advanceTimersToNextTimerAsync();
    await vi.advanceTimersToNextTimerAsync();

    const sessionExpirationWarning = screen.getByText(/Your session will expire in/i);
    expect(sessionExpirationWarning).toBeInTheDocument();

    const extendBtn = screen.getByRole("button", { name: /Yes, extend session/i });
    expect(extendBtn).toBeInTheDocument();

    fireEvent.click(extendBtn);

    expect(screen.queryByText(/Your session will expire in/i)).not.toBeInTheDocument();
  });

  it("calls Auth.signOut when countdown timer reaches 0", async () => {
    vi.spyOn(hooks, "useCountdown").mockReturnValue([
      0,
      { startCountdown: vi.fn(), stopCountdown: vi.fn(), resetCountdown: vi.fn() },
    ]);

    render(<ParentComponent />);

    const signOutSpy = vi.spyOn(Auth, "signOut");
    expect(signOutSpy).toHaveBeenCalled();
  });

  it("calls Auth.signOut when user clicks sign out", async () => {
    render(<ParentComponent />);

    await vi.advanceTimersToNextTimerAsync();
    await vi.advanceTimersToNextTimerAsync();

    const sessionExpirationWarning = screen.getByText(/Your session will expire in/i);
    expect(sessionExpirationWarning).toBeInTheDocument();

    const signOutBtn = screen.getByRole("button", { name: /No, sign out/i });
    expect(signOutBtn).toBeInTheDocument();

    const signOutSpy = vi.spyOn(Auth, "signOut");

    fireEvent.click(signOutBtn);

    expect(signOutSpy).toHaveBeenCalled();

    setDefaultStateSubmitter();
  });
});
