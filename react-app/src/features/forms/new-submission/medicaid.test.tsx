import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, test, expect, beforeAll } from "vitest";
import { MedicaidForm } from "./Medicaid";
import { formSchemas } from "@/formSchemas";
import { uploadFiles } from "@/utils/test-helpers/uploadFiles";
import { skipCleanup, mockApiRefinements } from "@/utils/test-helpers/skipCleanup";
import { renderFormAsync } from "@/utils/test-helpers/renderForm";
import { EXISTING_ITEM_ID } from "mocks";

const upload = uploadFiles<(typeof formSchemas)["new-medicaid-submission"]>();

describe("Medicaid SPA", () => {
  beforeAll(async () => {
    skipCleanup();
    mockApiRefinements();

    await renderFormAsync(<MedicaidForm />);
  });

  test("SPA ID", async () => {
    const spaIdInput = screen.getByLabelText(/SPA ID/);
    const spaIdLabel = screen.getByTestId("spaid-label");

    // test id validations
    // fails if item exists
    await userEvent.type(spaIdInput, EXISTING_ITEM_ID);
    const recordExistsErrorText = screen.getByText(
      /According to our records, this SPA ID already exists. Please check the SPA ID and try entering it again./,
    );
    expect(recordExistsErrorText).toBeInTheDocument();

    await userEvent.clear(spaIdInput);

    // fails if state entered is not a valid state
    await userEvent.type(spaIdInput, "AK-00-0000");
    const invalidStateErrorText = screen.getByText(
      /You can only submit for a state you have access to. If you need to add another state, visit your IDM user profile to request access./,
    );
    expect(invalidStateErrorText).toBeInTheDocument();

    await userEvent.clear(spaIdInput);

    // end of test id validations
    await userEvent.type(spaIdInput, "MD-00-0001");

    expect(spaIdLabel).not.toHaveClass("text-destructive");
  });

  test("PROPOSED EFFECTIVE DATE OF MEDICAID SPA", async () => {
    await userEvent.click(screen.getByTestId("proposedEffectiveDate-datepicker"));
    await userEvent.keyboard("{Enter}");
    const proposedEffectiveDateLabel = screen.getByText("Proposed Effective Date of Medicaid SPA");

    expect(proposedEffectiveDateLabel).not.toHaveClass("text-destructive");
  });

  test("CMS FORM 179", async () => {
    const cmsForm179PlanLabel = await upload("cmsForm179");
    expect(cmsForm179PlanLabel).not.toHaveClass("text-destructive");
  });

  test("SPA PAGES", async () => {
    const spaPagesLabel = await upload("spaPages");

    expect(spaPagesLabel).not.toHaveClass("text-destructive");
  });

  test("submit button is enabled", async () => {
    expect(screen.getByTestId("submit-action-form")).toBeEnabled();
  });
});
