import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
  EXISTING_ITEM_APPROVED_AMEND_ID,
  EXISTING_ITEM_APPROVED_NEW_ID,
  EXISTING_ITEM_PENDING_ID,
  NOT_FOUND_ITEM_ID,
  TEST_ITEM_ID,
} from "mocks";
import { describe, expect, test, vi } from "vitest";

import { formSchemas } from "@/formSchemas";
import { renderFormWithPackageSectionAsync } from "@/utils/test-helpers/renderForm";
import { uploadFiles } from "@/utils/test-helpers/uploadFiles";

import { RenewalForm } from "./Renewal";

vi.mock("@/hooks/useFeatureFlag", () => ({
  useFeatureFlag: (flag: string) => flag === "SAVE_IN_PROGRESS",
}));

const upload = uploadFiles<(typeof formSchemas)["contracting-renewal"]>();
const setup = async () => renderFormWithPackageSectionAsync(<RenewalForm />);

describe("RENEWAL CONTRACTING WAIVER", () => {
  test("WAIVER ID EXISTING", async () => {
    await setup();
    const waiverIdInput = await screen.findByLabelText(/existing waiver number to renew/i);
    const waiverIdLabel = screen.getByTestId("waiverid-existing-label");

    // test record does not exist error occurs
    await userEvent.type(waiverIdInput, NOT_FOUND_ITEM_ID);
    const recordDoesNotExistError = await screen.findByText(
      "According to our records, this 1915(b) Waiver Number does not yet exist. Please check the 1915(b) Initial or Renewal Waiver Number and try entering it again.",
    );
    expect(recordDoesNotExistError).toBeInTheDocument();
    await userEvent.clear(waiverIdInput);
    // test record is not approved error occurs
    await userEvent.type(waiverIdInput, EXISTING_ITEM_PENDING_ID);
    const recordIsNotApproved = await screen.findByText(
      "According to our records, this 1915(b) Waiver Number is not approved. You must supply an approved 1915(b) Initial or Renewal Waiver Number.",
    );
    expect(recordIsNotApproved).toBeInTheDocument();
    await userEvent.clear(waiverIdInput);
    // test record is not able to be renewed or amended error occurs
    await userEvent.type(waiverIdInput, EXISTING_ITEM_APPROVED_AMEND_ID);
    const recordCanNotBeRenewed = await screen.findByText(
      "The 1915(b) Waiver Number entered does not seem to match our records. Please enter an approved 1915(b) Initial or Renewal Waiver Number, using a dash after the two character state abbreviation.",
    );
    expect(recordCanNotBeRenewed).toBeInTheDocument();
    await userEvent.clear(waiverIdInput);

    //valid id is entered
    await userEvent.type(waiverIdInput, EXISTING_ITEM_APPROVED_NEW_ID);

    await waitFor(() => expect(waiverIdLabel).not.toHaveClass("text-destructive"));
  });
  test("WAIVER ID RENEWAL", async () => {
    await setup();
    const waiverIdInput = screen.getByLabelText(/1915\(b\) Waiver Renewal Number/i);
    const waiverIdLabel = screen.getByTestId("waiverid-renewal-label");

    // validate id errors
    // item exists validation error occurs
    await userEvent.type(waiverIdInput, TEST_ITEM_ID);
    const itemExistsErrorMessage = await screen.findByText(
      "According to our records, this 1915(b) Waiver Number already exists. Please check the 1915(b) Waiver Number and try entering it again.",
    );
    expect(itemExistsErrorMessage).toBeInTheDocument();
    await userEvent.clear(waiverIdInput);
    // state error occurs
    await userEvent.type(waiverIdInput, "AK-0000.R01.00");
    const invalidStateErrorMessage = screen.getByText(
      "You can only submit for a state you have access to. If you need to add another state, visit your IDM user profile to request access.",
    );
    expect(invalidStateErrorMessage).toBeInTheDocument();
    await userEvent.clear(waiverIdInput);

    // test record doesn't have an amendment number
    await userEvent.type(waiverIdInput, "MD-0000.R00.01");
    const waiverIdHasAmendment = screen.getByText(
      "The 1915(b) Waiver Renewal Number must be in the format of SS-####.R##.00 or SS-#####.R##.00. For renewals, the “R##” starts with ‘01’ and ascends.",
    );
    expect(waiverIdHasAmendment).toBeInTheDocument();
    // end of error validations

    await userEvent.clear(waiverIdInput);

    await userEvent.type(waiverIdInput, "MD-0006.R01.00");

    await waitFor(() => expect(waiverIdLabel).not.toHaveClass("text-destructive"));
  });

  test("shows a state-prefix validation error when renewal number does not match the existing waiver", async () => {
    await setup();
    const waiverIdExistingInput = await screen.findByLabelText(/existing waiver number to renew/i);
    const waiverIdRenewalInput = screen.getByLabelText(/1915\(b\) Waiver Renewal Number/i);

    await userEvent.type(waiverIdExistingInput, EXISTING_ITEM_APPROVED_NEW_ID);
    await userEvent.type(waiverIdRenewalInput, "VA-0006.R01.00");
    await userEvent.click(screen.getByTestId("save-draft-form"));

    expect(
      await screen.findByText(
        "The 1915(b) Waiver Renewal Number must start with MD to match the Existing Waiver Number to Renew.",
      ),
    ).toBeInTheDocument();
  });

  test("PROPOSED EFFECTIVE DATE OF RENEWAL CONTRACTING WAIVER", async () => {
    await setup();
    await userEvent.click(screen.getByTestId("proposedEffectiveDate-datepicker"));
    await userEvent.keyboard("{Enter}");

    const proposedEffectiveDateLabel = screen.getByText(
      "Proposed Effective Date of 1915(b) Waiver Renewal",
    );

    expect(proposedEffectiveDateLabel).not.toHaveClass("text-destructive");
  });

  test("B4 WAIVER APPLICATION", async () => {
    await setup();
    const cmsForm179PlanLabel = await upload("b4WaiverApplication");
    expect(cmsForm179PlanLabel).not.toHaveClass("text-destructive");
  });
  test("B4 INDEPENDENT ASSESSMENT", async () => {
    await setup();
    const cmsForm179PlanLabel = await upload("b4IndependentAssessment");
    expect(cmsForm179PlanLabel).not.toHaveClass("text-destructive");
  });
  test("OTHER", async () => {
    await setup();
    const cmsForm179PlanLabel = await upload("other");
    expect(cmsForm179PlanLabel).not.toHaveClass("text-destructive");
  });
  test("TRIBAL CONSULTATION", async () => {
    await setup();
    const cmsForm179PlanLabel = await upload("tribalConsultation");
    expect(cmsForm179PlanLabel).not.toHaveClass("text-destructive");
  });

  test("submit button is enabled", async () => {
    await setup();
    const waiverIdExistingInput = await screen.findByLabelText(/existing waiver number to renew/i);
    const waiverIdRenewalInput = screen.getByLabelText(/1915\(b\) Waiver Renewal Number/i);

    await userEvent.type(waiverIdExistingInput, EXISTING_ITEM_APPROVED_NEW_ID);
    await userEvent.type(waiverIdRenewalInput, "MD-0006.R01.00");
    await userEvent.click(screen.getByTestId("proposedEffectiveDate-datepicker"));
    await userEvent.keyboard("{Enter}");
    await upload("b4WaiverApplication");
    await waitFor(() => expect(screen.getByTestId("submit-action-form")).toBeEnabled());
  });
});
