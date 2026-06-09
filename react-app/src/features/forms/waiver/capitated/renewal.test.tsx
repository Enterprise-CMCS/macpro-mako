import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
  EXISTING_ITEM_APPROVED_AMEND_ID,
  EXISTING_ITEM_APPROVED_NEW_ID,
  EXISTING_ITEM_PENDING_ID,
  NOT_FOUND_ITEM_ID,
  TEST_ITEM_ID,
} from "mocks";
import { beforeAll, describe, expect, test, vi } from "vitest";

import { formSchemas } from "@/formSchemas";
import { renderFormWithPackageSectionAsync } from "@/utils/test-helpers/renderForm";
import { mockApiRefinements } from "@/utils/test-helpers/skipCleanup";
import { uploadFiles } from "@/utils/test-helpers/uploadFiles";

import { Renewal } from "./Renewal";

vi.mock("@/hooks/useFeatureFlag", () => ({
  useFeatureFlag: (flag: string) => flag === "SAVE_IN_PROGRESS",
}));

const upload = uploadFiles<(typeof formSchemas)["capitated-renewal"]>();
const setup = async () => renderFormWithPackageSectionAsync(<Renewal />);

describe("Capitated Renewal", () => {
  beforeAll(() => {
    mockApiRefinements();
  });

  test("EXISTING RENEWAL NUMBER TO RENEW", async () => {
    await setup();
    const existingWaiverInput = await screen.findByLabelText(/Existing Waiver Number to Renew/);
    const existingWaiverLabel = screen.getByTestId("existing-waiver-label");

    // test record does not exist error occurs
    await userEvent.type(existingWaiverInput, NOT_FOUND_ITEM_ID);
    const recordDoesNotExistError = await screen.findByText(
      "According to our records, this 1915(b) Waiver Number does not yet exist. Please check the 1915(b) Initial or Renewal Waiver Number and try entering it again.",
    );
    expect(recordDoesNotExistError).toBeInTheDocument();
    await userEvent.clear(existingWaiverInput);
    // test record is not approved error occurs
    await userEvent.type(existingWaiverInput, EXISTING_ITEM_PENDING_ID);
    const recordIsNotApproved = await screen.findByText(
      "According to our records, this 1915(b) Waiver Number is not approved. You must supply an approved 1915(b) Initial or Renewal Waiver Number.",
    );
    expect(recordIsNotApproved).toBeInTheDocument();
    await userEvent.clear(existingWaiverInput);
    // test record is not able to be renewed or amended error occurs
    await userEvent.type(existingWaiverInput, EXISTING_ITEM_APPROVED_AMEND_ID);
    const recordCanNotBeRenewed = await screen.findByText(
      "The 1915(b) Waiver Number entered does not seem to match our records. Please enter an approved 1915(b) Initial or Renewal Waiver Number, using a dash after the two character state abbreviation.",
    );
    expect(recordCanNotBeRenewed).toBeInTheDocument();
    await userEvent.clear(existingWaiverInput);
    //valid id is entered
    await userEvent.type(existingWaiverInput, EXISTING_ITEM_APPROVED_NEW_ID);

    await waitFor(() => expect(existingWaiverLabel).not.toHaveClass("text-destructive"));
  });

  test("1915(B) WAIVER RENEWAL NUMBER", async () => {
    await setup();
    const waiverRenewalInput = screen.getByLabelText(/Waiver Renewal Number/);
    const waiverRenewalLabel = screen.getByTestId("1915b-waiver-renewal-label");

    // validate id errors
    // item exists validation error occurs
    await userEvent.type(waiverRenewalInput, TEST_ITEM_ID);
    const itemExistsErrorMessage = await screen.findByText(
      "According to our records, this 1915(b) Waiver Number already exists. Please check the 1915(b) Waiver Number and try entering it again.",
    );
    expect(itemExistsErrorMessage).toBeInTheDocument();
    await userEvent.clear(waiverRenewalInput);
    // state error occurs
    await userEvent.type(waiverRenewalInput, "AK-0005.R01.00");
    const invalidStateErrorMessage = screen.getByText(
      "You can only submit for a state you have access to. If you need to add another state, visit your IDM user profile to request access.",
    );
    expect(invalidStateErrorMessage).toBeInTheDocument();
    await userEvent.clear(waiverRenewalInput);

    await userEvent.type(waiverRenewalInput, "MD-0005.R01.01");
    const invalidAmendmentInput = screen.getByText(
      "The 1915(b) Waiver Renewal Number must be in the format of SS-####.R##.00 or SS-#####.R##.00. For renewals, the “R##” starts with ‘01’ and ascends.",
    );
    expect(invalidAmendmentInput).toBeInTheDocument();
    // end of error validations

    await userEvent.clear(waiverRenewalInput);
    await userEvent.type(waiverRenewalInput, "MD-0005.R99.00");

    await waitFor(() => expect(waiverRenewalLabel).not.toHaveClass("text-destructive"));
  });

  test("shows a state-prefix validation error when renewal number does not match the existing waiver", async () => {
    await setup();
    const existingWaiverInput = await screen.findByLabelText(/Existing Waiver Number to Renew/);
    const waiverRenewalInput = screen.getByLabelText(/Waiver Renewal Number/);

    await userEvent.type(existingWaiverInput, EXISTING_ITEM_APPROVED_NEW_ID);
    await userEvent.type(waiverRenewalInput, "VA-0005.R01.00");
    await userEvent.click(screen.getByTestId("save-draft-form"));

    expect(
      await screen.findByText(
        "The 1915(b) Waiver Renewal Number must start with MD to match the Existing Waiver Number to Renew.",
      ),
    ).toBeInTheDocument();
  });

  test("PROPOSED EFFECTIVE DATE OF 1915(B) WAIVER RENEWAL", async () => {
    await setup();
    await userEvent.click(screen.getByTestId("proposedEffectiveDate-datepicker"));
    await userEvent.keyboard("{Enter}");
    const proposedEffectiveDateLabel = screen.getByText(
      "Proposed Effective Date of 1915(b) Waiver Renewal",
    );

    expect(proposedEffectiveDateLabel).not.toHaveClass("text-destructive");
  });

  test("1915(B) COMPREHENSIVE (CAPITATED) WAIVER APPLICATION PRE-PRINT", async () => {
    await setup();
    const appPrePrint = await upload("bCapWaiverApplication");
    expect(appPrePrint).not.toHaveClass("text-destructive");
  });

  test("1915(B) COMPREHENSIVE (CAPITATED) WAIVER COST EFFECTIVENESS SPREADSHEETS", async () => {
    await setup();
    const costEffectivenessSpreadsheets = await upload("bCapCostSpreadsheets");
    expect(costEffectivenessSpreadsheets).not.toHaveClass("text-destructive");
  });

  test("submit button is enabled", async () => {
    await setup();
    const existingWaiverInput = await screen.findByLabelText(/Existing Waiver Number to Renew/);
    const waiverRenewalInput = screen.getByLabelText(/Waiver Renewal Number/);

    await userEvent.type(existingWaiverInput, EXISTING_ITEM_APPROVED_NEW_ID);
    await userEvent.type(waiverRenewalInput, "MD-0005.R99.00");
    await userEvent.click(screen.getByTestId("proposedEffectiveDate-datepicker"));
    await userEvent.keyboard("{Enter}");
    await upload("bCapWaiverApplication");
    await upload("bCapCostSpreadsheets");
    await waitFor(() => expect(screen.getByTestId("submit-action-form")).toBeEnabled());
  });
});
