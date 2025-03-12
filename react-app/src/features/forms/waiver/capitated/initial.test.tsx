import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { EXISTING_ITEM_APPROVED_AMEND_ID } from "mocks";
import { beforeAll, describe, expect, test } from "vitest";

import { InitialForm } from "./Initial";

import { formSchemas } from "@/formSchemas";
import { renderFormAsync } from "@/utils/test-helpers/renderForm";
import { mockApiRefinements, skipCleanup } from "@/utils/test-helpers/skipCleanup";
import { uploadFiles } from "@/utils/test-helpers/uploadFiles";

const upload = uploadFiles<(typeof formSchemas)["capitated-initial"]>();

describe("Capitated Initial", () => {
  beforeAll(async () => {
    skipCleanup();
    mockApiRefinements();

    await renderFormAsync(<InitialForm />);
  });

  test("1915(B) WAIVER NUMBER", async () => {
    const waiverInitialInput = screen.getByLabelText(/Initial Waiver Number/);
    const waiverInitialLabel = screen.getByTestId("1915b-waiver-initial-label");

    await userEvent.type(waiverInitialInput, EXISTING_ITEM_APPROVED_AMEND_ID);
    const recordExistsErrorText = screen.getByText(
      /The Initial Waiver Number must be in the format of SS-####.R00.00 or SS-#####.R00.00/,
    );
    expect(recordExistsErrorText).toBeInTheDocument();

    await userEvent.clear(waiverInitialInput);

    await userEvent.type(waiverInitialInput, "AK-0000.R00.00");
    const invalidStateErrorText = screen.getByText(
      /You can only submit for a state you have access to. If you need to add another state, visit your IDM user profile to request access./,
    );
    expect(invalidStateErrorText).toBeInTheDocument();

    await userEvent.clear(waiverInitialInput);

    await userEvent.type(waiverInitialInput, "MD-0006.R00.00");

    expect(waiverInitialLabel).not.toHaveClass("text-destructive");
  });

  test("PROPOSED EFFECTIVE DATE OF 1915(B) WAIVER INITIAL", async () => {
    await userEvent.click(screen.getByTestId("proposedEffectiveDate-datepicker"));
    await userEvent.keyboard("{Enter}");
    const proposedEffectiveDateLabel = screen.getByText(
      "Proposed Effective Date of 1915(b) Initial Waiver",
    );

    expect(proposedEffectiveDateLabel).not.toHaveClass("text-destructive");
  });

  test("1915(B) COMPREHENSIVE (CAPITATED) WAIVER APPLICATION PRE-PRINT", async () => {
    const appPrePrint = await upload("bCapWaiverApplication");
    expect(appPrePrint).not.toHaveClass("text-destructive");
  });

  test("1915(B) COMPREHENSIVE (CAPITATED) WAIVER COST EFFECTIVENESS SPREADSHEETS", async () => {
    const costEffectivenessSpreadsheets = await upload("bCapCostSpreadsheets");
    expect(costEffectivenessSpreadsheets).not.toHaveClass("text-destructive");
  });

  test("submit button is enabled", () => {
    expect(screen.getByTestId("submit-action-form")).toBeEnabled();
  });
});
