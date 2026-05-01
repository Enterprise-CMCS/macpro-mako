import { screen, within } from "@testing-library/react";
import { WITHDRAW_RAI_ITEM_B } from "mocks";
import { describe, expect, it, vi } from "vitest";

import { renderFormWithPackageSectionAsync } from "@/utils/test-helpers/renderForm";

import { DisableWithdrawRaiForm, EnableWithdrawRaiForm } from ".";

vi.mock("react-router", async () => ({
  ...(await vi.importActual<Record<string, unknown>>("react-router")),
  useParams: vi.fn().mockReturnValue({ authority: "1915(b)", id: WITHDRAW_RAI_ITEM_B }),
}));

vi.mock("shared-utils", async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...(typeof actual === "object" && actual !== null ? actual : {}),
    isCmsUser: vi.fn().mockReturnValue(true),
  };
});

describe("Toggle Withdraw Rai components", () => {
  const expectCommonFormFields = () => {
    const detailSection = screen.getByTestId("detail-section");

    expect(within(detailSection).getByText("Waiver Number")).toBeInTheDocument();
    expect(within(detailSection).getByText(WITHDRAW_RAI_ITEM_B, { selector: "p" })).toBeInTheDocument();
    expect(within(detailSection).getByText("Authority")).toBeInTheDocument();
    expect(within(detailSection).getByText("1915(b) Waiver", { selector: "p" })).toBeInTheDocument();
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
});
