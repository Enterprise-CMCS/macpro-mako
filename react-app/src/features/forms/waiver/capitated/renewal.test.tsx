import { screen } from "@testing-library/react";
import { beforeAll, describe, expect, test } from "vitest";
import userEvent from "@testing-library/user-event";
import { renderFormAsync } from "@/utils/test-helpers/renderForm";
import { mockApiRefinements, skipCleanup } from "@/utils/test-helpers/skipCleanup";
import { Renewal } from "./Renewal";
import { uploadFiles } from "@/utils/test-helpers/uploadFiles";
import { formSchemas } from "@/formSchemas";
import {
  EXISTING_ITEM_PENDING_ID,
  EXISTING_ITEM_APPROVED_AMEND_ID,
  NOT_FOUND_ITEM_ID,
  EXISTING_ITEM_APPROVED_NEW_ID,
  TEST_ITEM_ID,
} from "mocks";

const upload = uploadFiles<(typeof formSchemas)["capitated-renewal"]>();

describe("Capitated Renewal", () => {
  beforeAll(async () => {
    skipCleanup();
    mockApiRefinements();

    await renderFormAsync(<Renewal />);
  });

  test("EXISTING RENEWAL NUMBER TO RENEW", async () => {
    const existingWaiverInput = screen.getByLabelText(/Existing Waiver Number to Renew/);
    const existingWaiverLabel = screen.getByTestId("existing-waiver-label");

    // test record does not exist error occurs
    await userEvent.type(existingWaiverInput, NOT_FOUND_ITEM_ID);
    const recordDoesNotExistError = screen.getByText(
      "According to our records, this 1915(b) Waiver Number does not yet exist. Please check the 1915(b) Initial or Renewal Waiver Number and try entering it again.",
    );
    expect(recordDoesNotExistError).toBeInTheDocument();
    await userEvent.clear(existingWaiverInput);
    // test record is not approved error occurs
    await userEvent.type(existingWaiverInput, EXISTING_ITEM_PENDING_ID);
    const recordIsNotApproved = screen.getByText(
      "According to our records, this 1915(b) Waiver Number is not approved. You must supply an approved 1915(b) Initial or Renewal Waiver Number.",
    );
    expect(recordIsNotApproved).toBeInTheDocument();
    await userEvent.clear(existingWaiverInput);
    // test record is not able to be renewed or amended error occurs
    await userEvent.type(existingWaiverInput, EXISTING_ITEM_APPROVED_AMEND_ID);
    const recordCanNotBeRenewed = screen.getByText(
      "The 1915(b) Waiver Number entered does not seem to match our records. Please enter an approved 1915(b) Initial or Renewal Waiver Number, using a dash after the two character state abbreviation.",
    );
    expect(recordCanNotBeRenewed).toBeInTheDocument();
    await userEvent.clear(existingWaiverInput);
    //valid id is entered
    await userEvent.type(existingWaiverInput, EXISTING_ITEM_APPROVED_NEW_ID);

    expect(existingWaiverLabel).not.toHaveClass("text-destructive");
  });

  test("1915(B) WAIVER RENEWAL NUMBER", async () => {
    const waiverRenewalInput = screen.getByLabelText(/Waiver Renewal Number/);
    const waiverRenewalLabel = screen.getByTestId("1915b-waiver-renewal-label");

    // validate id errors
    // item exists validation error occurs
    await userEvent.type(waiverRenewalInput, TEST_ITEM_ID);
    const itemExistsErrorMessage = screen.getByText(
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

    expect(waiverRenewalLabel).not.toHaveClass("text-destructive");
  });

  test("PROPOSED EFFECTIVE DATE OF 1915(B) WAIVER RENEWAL", async () => {
    await userEvent.click(screen.getByTestId("proposedEffectiveDate-datepicker"));
    await userEvent.keyboard("{Enter}");
    const proposedEffectiveDateLabel = screen.getByText(
      "Proposed Effective Date of 1915(b) Waiver Renewal",
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
