import { screen } from "@testing-library/react";
import { beforeAll, describe, expect, test } from "vitest";
import userEvent from "@testing-library/user-event";
import { renderForm } from "@/utils/test-helpers/renderForm";
import { skipCleanup, mockApiRefinements } from "@/utils/test-helpers/skipCleanup";
import { skipCleanup, mockApiRefinements } from "@/utils/test-helpers/skipCleanup";
import { AmendmentForm } from "./Amendment";
import { uploadFiles } from "@/utils/test-helpers/uploadFiles";
import { formSchemas } from "@/formSchemas";

const upload = uploadFiles<(typeof formSchemas)["capitated-amendment"]>();

let container: HTMLElement;

describe("Capitated Amendment", () => {
  beforeAll(() => {
    skipCleanup();
    mockApiRefinements();

    const { container: renderedContainer } = renderForm(<AmendmentForm />);

    container = renderedContainer;
  });

  test("EXISTING WAIVER NUMBER TO AMEND", async () => {
    const existingWaiverInput = screen.getByLabelText(/Existing Waiver Number to Amend/);
    const existingWaiverInput = screen.getByLabelText(/Existing Waiver Number to Amend/);
    const existingWaiverLabel = screen.getByTestId("existing-waiver-label");

    // test record does not exist error occurs
    await userEvent.type(existingWaiverInput, "MD-0004.R00.00");
    const recordDoesNotExistError = screen.getByText(
      "According to our records, this 1915(b) Waiver Number does not yet exist. Please check the 1915(b) Initial or Renewal Waiver Number and try entering it again.",
    );
    expect(recordDoesNotExistError).toBeInTheDocument();
    await userEvent.clear(existingWaiverInput);
    // test record is not approved error occurs
    await userEvent.type(existingWaiverInput, "MD-0002.R00.00");
    const recordIsNotApproved = screen.getByText(
      "According to our records, this 1915(b) Waiver Number is not approved. You must supply an approved 1915(b) Initial or Renewal Waiver Number.",
    );
    expect(recordIsNotApproved).toBeInTheDocument();
    await userEvent.clear(existingWaiverInput);
    // test record is not able to be renewed or amended error occurs
    await userEvent.type(existingWaiverInput, "MD-0001.R00.00");
    const recordCanNotBeRenewed = screen.getByText(
      "The 1915(b) Waiver Number entered does not seem to match our records. Please enter an approved 1915(b) Initial or Renewal Waiver Number, using a dash after the two character state abbreviation.",
    );
    expect(recordCanNotBeRenewed).toBeInTheDocument();
    await userEvent.clear(existingWaiverInput);
    //valid id is entered
    await userEvent.type(existingWaiverInput, "MD-0000.R00.00");

    expect(existingWaiverLabel).not.toHaveClass("text-destructive");
  });

  test("1915(B) WAIVER AMENDMENT NUMBER", async () => {
    const waiverAmendmentInput = screen.getByLabelText(/Waiver Amendment Number/);
    const waiverAmendmentLabel = screen.getByTestId("1915b-waiver-amendment-label");
    const waiverAmendmentInput = screen.getByLabelText(/Waiver Amendment Number/);
    const waiverAmendmentLabel = screen.getByTestId("1915b-waiver-amendment-label");

    // validate id errors
    // item exists validation error occurs
    await userEvent.type(waiverAmendmentInput, "MD-0000.R00.01");
    const itemExistsErrorMessage = screen.getByText(
      "According to our records, this 1915(b) Waiver Number already exists. Please check the 1915(b) Waiver Number and try entering it again.",
    );
    expect(itemExistsErrorMessage).toBeInTheDocument();
    await userEvent.clear(waiverAmendmentInput);
    // state error occurs
    await userEvent.type(waiverAmendmentInput, "AK-0000.R00.01");
    const invalidStateErrorMessage = screen.getByText(
      "You can only submit for a state you have access to. If you need to add another state, visit your IDM user profile to request access.",
    );
    expect(invalidStateErrorMessage).toBeInTheDocument();
    await userEvent.clear(waiverAmendmentInput);
    // end of error validations

    await userEvent.type(waiverAmendmentInput, "MD-0005.R00.01");

    expect(waiverAmendmentLabel).not.toHaveClass("text-destructive");
  });

  test("PROPOSED EFFECTIVE DATE OF 1915(B) WAIVER AMENDMENT", async () => {
    await userEvent.click(screen.getByTestId("proposedEffectiveDate-datepicker"));
    await userEvent.click(screen.getByTestId("proposedEffectiveDate-datepicker"));
    await userEvent.keyboard("{Enter}");
    const proposedEffectiveDateLabel = container.querySelector('[for="proposedEffectiveDate"]');
    const proposedEffectiveDateLabel = container.querySelector('[for="proposedEffectiveDate"]');

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

describe("AMENDMENT CAPITATED WAIVER WITH EXISTING WAIVERID", () => {
  beforeAll(() => {
    skipCleanup();
    mockApiRefinements();

    const { container: renderedContainer } = renderForm(<AmendmentForm />);

    container = renderedContainer;
  });
  test("waiver id is rendered on page", async () => {
    const { container: renderedContainer } = renderForm(
      <AmendmentForm waiverId="AK-0000.R00.11" />,
    );

    container = renderedContainer;

    const existingWaiverId = screen.getByTestId("existing-waiver-id");
    expect(existingWaiverId).toHaveTextContent("AK-0000.R00.11");
  });
});
