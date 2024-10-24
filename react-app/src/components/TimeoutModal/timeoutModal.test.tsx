import { render } from "@testing-library/react";
import { vi, describe, it, expect } from "vitest";
import { TimeoutModal } from ".";

vi.mock("@/hooks", () => ({
  useIdle: vi.fn().mockReturnValue(false),
  useCountdown: vi.fn().mockReturnValue([
    15,
    {
      startCountdown: vi.fn(),
      stopCountdown: vi.fn(),
      resetCountdown: vi.fn(),
    },
  ]),
}));

vi.mock("@/api", () => ({
  useGetUser: vi.fn().mockReturnValue({ data: {} }),
}));

describe("Timeout Modal", () => {
  it("displays a modal after 20 minutes", () => {
    const { queryByText } = render(<TimeoutModal />);
    const sessionExpirationWarning = queryByText(/Session expiring soon/i);
    expect(sessionExpirationWarning).not.toBeInTheDocument();
  });
});
