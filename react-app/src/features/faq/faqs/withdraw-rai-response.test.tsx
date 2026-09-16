import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { WithdrawChipSpaRaiResponse } from "./spa/withdraw-chip-spa-rai-response";
import { WithdrawSpaRaiResponse } from "./spa/withdraw-spa-rai-response";
import { WithdrawWaiverRaiResponse } from "./waiver/withdraw-waiver-rai-response";

const mockUseFeatureFlag = vi.hoisted(() => vi.fn(() => false));

vi.mock("@/hooks/useFeatureFlag", () => ({
  useFeatureFlag: mockUseFeatureFlag,
}));

const faqAnswers = [
  ["Medicaid SPA", WithdrawSpaRaiResponse],
  ["CHIP SPA", WithdrawChipSpaRaiResponse],
  ["Waiver", WithdrawWaiverRaiResponse],
] as const;

describe.each(faqAnswers)("%s Withdraw RAI Response FAQ", (_name, Answer) => {
  beforeEach(() => {
    mockUseFeatureFlag.mockReturnValue(false);
  });

  it("shows the CMS Enable action instructions while the flag is off", () => {
    render(<Answer />);

    expect(screen.getByText(/As a CMS user, log in to OneMAC/)).toBeInTheDocument();
    expect(
      screen.getByText(/select the Enable Formal RAI Response Withdraw link/),
    ).toBeInTheDocument();
  });

  it("hides only the CMS Enable action instructions while the flag is on", () => {
    mockUseFeatureFlag.mockReturnValue(true);

    render(<Answer />);

    expect(screen.queryByText(/As a CMS user, log in to OneMAC/)).not.toBeInTheDocument();
    expect(
      screen.queryByText(/select the Enable Formal RAI Response Withdraw link/),
    ).not.toBeInTheDocument();
    expect(
      screen.getByText(/If a state wishes to withdraw a Formal RAI Response/),
    ).toBeInTheDocument();
    expect(screen.getByText(/On the Formal RAI Response Withdraw form/)).toBeInTheDocument();
  });
});
