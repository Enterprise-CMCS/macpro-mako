vi.mock("react-router", () => ({
  useBlocker: vi.fn(),
}));

import { render } from "@testing-library/react";
import { useBlocker } from "react-router";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { userPrompt } from "@/components";

import { useNavigationPrompt } from "./useNavigationPrompt";

vi.mock("@/components", () => ({
  userPrompt: vi.fn(),
}));

describe("useNavigationPrompt", () => {
  const mockProceed = vi.fn();
  const promptProps = {
    header: "Stop form submission?",
    body: "All information you've entered on this form will be lost if you leave this page.",
    acceptButtonText: "Yes, leave form",
    cancelButtonText: "Return to form",
    areButtonsReversed: true,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  function TestComponent({ shouldBlock }: { shouldBlock: boolean }) {
    useNavigationPrompt({
      shouldBlock,
      prompt: promptProps,
    });
    return null;
  }

  it("does not trigger prompt when shouldBlock is false", () => {
    (useBlocker as any).mockReturnValue({ state: "unblocked" });

    render(<TestComponent shouldBlock={false} />);
    expect(userPrompt).not.toHaveBeenCalled();
  });

  it("triggers prompt and calls proceed on accept when blocked", () => {
    (useBlocker as any).mockReturnValue({
      state: "blocked",
      proceed: mockProceed,
    });

    render(<TestComponent shouldBlock={true} />);

    expect(userPrompt).toHaveBeenCalledTimes(1);
    expect(userPrompt).toHaveBeenCalledWith({
      ...promptProps,
      onAccept: expect.any(Function),
    });

    const onAccept = (userPrompt as any).mock.calls[0][0].onAccept;
    onAccept();

    expect(mockProceed).toHaveBeenCalledTimes(1);
  });
});
