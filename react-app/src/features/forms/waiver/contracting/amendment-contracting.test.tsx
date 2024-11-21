import { formSchemas } from "@/formSchemas";
import { renderForm } from "@/utils/test-helpers/renderForm";
import { skipCleanup } from "@/utils/test-helpers/skipCleanup";
import { uploadFiles } from "@/utils/test-helpers/uploadFiles";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeAll, describe, expect, test } from "vitest";
import { beforeAll, describe, expect, test } from "vitest";
import { AmendmentForm } from "./Amendment";

const upload = uploadFiles<(typeof formSchemas)["contracting-amendment"]>();

// use container globally for tests to use same render and let each test fill out inputs
// and at the end validate button is enabled for submit
let container: HTMLElement;

describe("AMENDMENT CONTRACTING WAIVER", () => {
  beforeAll(() => {
    skipCleanup();

    const { container: renderedContainer } = renderForm(<AmendmentForm />);

    container = renderedContainer;
  });

  test("WAIVER ID EXISTING", async () => {
    const waiverIdInput = screen.getByLabelText(/existing waiver number to amend/i);
    const waiverIdLabel = screen.getByTestId("existing-waiver-label");
    const waiverIdInput = screen.getByLabelText(/existing waiver number to amend/i);
    const waiverIdLabel = screen.getByTestId("existing-waiver-label");

    // test record does not exist error occurs
    await userEvent.type(waiverIdInput, "MD-0004.R00.00");
    const recordDoesNotExistError = screen.getByText(
      "According to our records, this 1915(b) Waiver Number does not yet exist. Please check the 1915(b) Initial or Renewal Waiver Number and try entering it again.",
    );
    expect(recordDoesNotExistError).toBeInTheDocument();
    await userEvent.clear(waiverIdInput);
    // test record is not approved error occurs
    await userEvent.type(waiverIdInput, "MD-0002.R00.00");
    const recordIsNotApproved = screen.getByText(
      "According to our records, this 1915(b) Waiver Number is not approved. You must supply an approved 1915(b) Initial or Renewal Waiver Number.",
    );
    expect(recordIsNotApproved).toBeInTheDocument();
    await userEvent.clear(waiverIdInput);
    // test record is not able to be renewed or amended error occurs
    await userEvent.type(waiverIdInput, "MD-0001.R00.00");
    const recordCanNotBeRenewed = screen.getByText(
      "The 1915(b) Waiver Number entered does not seem to match our records. Please enter an approved 1915(b) Initial or Renewal Waiver Number, using a dash after the two character state abbreviation.",
    );
    expect(recordCanNotBeRenewed).toBeInTheDocument();
    await userEvent.clear(waiverIdInput);
    //valid id is entered
    await userEvent.type(waiverIdInput, "MD-0000.R00.00");

    expect(waiverIdLabel).not.toHaveClass("text-destructive");
  });

  test("WAIVER ID AMENDMENT", async () => {
    const waiverIdInput = screen.getByLabelText(/1915\(b\) Waiver Amendment Number/i);
    const waiverIdInput = screen.getByLabelText(/1915\(b\) Waiver Amendment Number/i);
    const waiverIdLabel = screen.getByTestId("waiverid-amendment-label");

    // validate id errors
    // item exists validation error occurs
    await userEvent.type(waiverIdInput, "MD-0000.R00.01");
    const itemExistsErrorMessage = screen.getByText(
      "According to our records, this 1915(b) Waiver Number already exists. Please check the 1915(b) Waiver Number and try entering it again.",
    );
    expect(itemExistsErrorMessage).toBeInTheDocument();
    await userEvent.clear(waiverIdInput);
    // state error occurs
    await userEvent.type(waiverIdInput, "AK-0000.R00.01");
    const invalidStateErrorMessage = screen.getByText(
      "You can only submit for a state you have access to. If you need to add another state, visit your IDM user profile to request access.",
    );
    expect(invalidStateErrorMessage).toBeInTheDocument();
    await userEvent.clear(waiverIdInput);
    // end of error validations

    await userEvent.type(waiverIdInput, "MD-0005.R00.01");

    expect(waiverIdLabel).not.toHaveClass("text-destructive");
  });

  test("PROPOSED EFFECTIVE DATE OF AMENDMENT CONTRACTING WAIVER", async () => {
    await userEvent.click(screen.getByTestId("proposedEffectiveDate-datepicker"));
    await userEvent.click(screen.getByTestId("proposedEffectiveDate-datepicker"));
    await userEvent.keyboard("{Enter}");
    const proposedEffectiveDateLabel = container.querySelector('[for="proposedEffectiveDate"]');
    const proposedEffectiveDateLabel = container.querySelector('[for="proposedEffectiveDate"]');

    expect(proposedEffectiveDateLabel).not.toHaveClass("text-destructive");
  });

  test("B4 WAIVER APPLICATION", async () => {
    const cmsForm179PlanLabel = await upload("b4WaiverApplication");
    expect(cmsForm179PlanLabel).not.toHaveClass("text-destructive");
  });
  test("OTHER", async () => {
    const cmsForm179PlanLabel = await upload("other");
    expect(cmsForm179PlanLabel).not.toHaveClass("text-destructive");
  });
  test("TRIBAL CONSULTATION", async () => {
    const cmsForm179PlanLabel = await upload("tribalConsultation");
    expect(cmsForm179PlanLabel).not.toHaveClass("text-destructive");
  });

  test("submit button is enabled", async () => {
    expect(screen.getByTestId("submit-action-form")).toBeEnabled();
  });
});

describe("Contracting Amendment with existing waiver Id", () => {
  test("existing waiver id is filled out", async () => {
    renderForm(<AmendmentForm waiverId="AK-0000.R00.11" />);

    const existingWaiverId = screen.getByTestId("existing-waiver-id");
    expect(existingWaiverId).toHaveTextContent("AK-0000.R00.11");
  });
});
