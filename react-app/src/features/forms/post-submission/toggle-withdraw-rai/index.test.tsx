import { screen, within } from "@testing-library/react";
import { WITHDRAW_RAI_ITEM_B } from "mocks";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { renderFormWithPackageSectionAsync } from "@/utils/test-helpers/renderForm";

import { PostSubmissionWrapper } from "../post-submission-forms";
import { DisableWithdrawRaiForm, EnableWithdrawRaiForm } from ".";

const { mockUseFeatureFlag, mockUseParams } = vi.hoisted(() => ({
  mockUseFeatureFlag: vi.fn(() => false),
  mockUseParams: vi.fn(),
}));

vi.mock("react-router", async () => ({
  ...(await vi.importActual<Record<string, unknown>>("react-router")),
  Navigate: ({ to }: { to: string }) => <div data-testid="redirect-target">{to}</div>,
  useParams: mockUseParams,
}));

vi.mock("@/hooks/useFeatureFlag", () => ({
  useFeatureFlag: mockUseFeatureFlag,
}));

vi.mock("shared-utils", async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...(typeof actual === "object" && actual !== null ? actual : {}),
    isCmsUser: vi.fn().mockReturnValue(true),
  };
});

describe("Toggle Withdraw Rai components", () => {
  beforeEach(() => {
    mockUseFeatureFlag.mockReturnValue(false);
    mockUseParams.mockReturnValue({ authority: "1915(b)", id: WITHDRAW_RAI_ITEM_B });
  });

  const expectCommonFormFields = () => {
    const detailSection = screen.getByTestId("detail-section");

    expect(within(detailSection).getByText("Waiver Number")).toBeInTheDocument();
    expect(
      within(detailSection).getByText(WITHDRAW_RAI_ITEM_B, { selector: "p" }),
    ).toBeInTheDocument();
    expect(within(detailSection).getByText("Authority")).toBeInTheDocument();
    expect(
      within(detailSection).getByText("1915(b) Waiver", { selector: "p" }),
    ).toBeInTheDocument();
    expect(screen.getByTestId("submit-action-form")).toBeDisabled();
    expect(screen.getByTestId("cancel-action-form")).toBeEnabled();
  };

  it("renders enable withdraw rai correctly", async () => {
    await renderFormWithPackageSectionAsync(<DisableWithdrawRaiForm />);

    expect(
      screen.getByRole("heading", {
        level: 1,
        name: "Disable Formal RAI Response Withdraw Details",
      }),
    ).toBeInTheDocument();
    expect(screen.getByText("Disable Formal RAI Response Withdraw")).toBeInTheDocument();
    expect(
      screen.getByText(
        "The state will not be able to withdraw its RAI response. It may take up to a minute for this change to be applied.",
      ),
    ).toBeInTheDocument();
    expectCommonFormFields();
  });

  it("renders disable withdraw rai correctly", async () => {
    await renderFormWithPackageSectionAsync(<EnableWithdrawRaiForm />);

    expect(
      screen.getByRole("heading", {
        level: 1,
        name: "Enable Formal RAI Response Withdraw Details",
      }),
    ).toBeInTheDocument();
    expect(screen.getByText("Enable Formal RAI Response Withdraw")).toBeInTheDocument();
    expect(
      screen.getByText(
        /Once you submit this form, the most recent Formal RAI Response for this\s+package will be able to be withdrawn by the state/,
      ),
    ).toBeInTheDocument();
    expectCommonFormFields();
  });

  it.each(["enable-rai-withdraw", "disable-rai-withdraw"])(
    "redirects direct %s URLs when the SMART launch flag is on",
    async (type) => {
      mockUseFeatureFlag.mockReturnValue(true);
      mockUseParams.mockReturnValue({
        type,
        authority: "1915(b)",
        id: WITHDRAW_RAI_ITEM_B,
      });

      await renderFormWithPackageSectionAsync(<PostSubmissionWrapper />);

      expect(screen.queryByTestId("submit-action-form")).not.toBeInTheDocument();
      expect(screen.getByTestId("redirect-target")).toHaveTextContent(
        `/details/1915(b)/${WITHDRAW_RAI_ITEM_B}`,
      );
    },
  );
});
