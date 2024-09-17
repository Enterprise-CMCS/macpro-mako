import { beforeAll, describe, expect, test } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { uploadFiles } from "@/utils/test-helpers/uploadFiles";
import { formSchemas } from "@/formSchemas";
import { TemporaryExtensionForm } from ".";
import { renderForm } from "@/utils/test-helpers/renderForm";
import { skipCleanup } from "@/utils/test-helpers/skipCleanup";

const upload = uploadFiles<(typeof formSchemas)["temporary-extension"]>();

// use container globally for tests to use same render and let each test fill out inputs
// and at the end validate button is enabled for submit

describe("Temporary Extension", () => {
  beforeAll(() => {
    skipCleanup();

    renderForm(<TemporaryExtensionForm />);
  });

  test("TEMPORARY EXTENSION TYPE", async () => {
    const teTypeDropdown = screen.getByRole("combobox");

    await userEvent.click(teTypeDropdown);

    const teOptionToClick = screen.getByRole("option", {
      name: "1915(b)",
    });

    await userEvent.click(teOptionToClick);

    expect(teTypeDropdown).toHaveTextContent("1915(b)");
  });

  test("APPROVED INITIAL OR RENEWAL WAIVER NUMBER", async () => {
    const waiverNumberInput = screen.getByLabelText(
      /Approved Initial or Renewal Waiver Number/,
    );
    const waiverNumberLabel = screen.getByTestId("waiverNumber-label");

    // test record does not exist error occurs
    await userEvent.type(waiverNumberInput, "MD-0004.R00.00");
    const recordDoesNotExistError = screen.getByText(
      "According to our records, this Approved Initial or Renewal Waiver Number does not yet exist. Please check the Approved Initial or Renewal Waiver Number and try entering it again.",
    );
    expect(recordDoesNotExistError).toBeInTheDocument();
    await userEvent.clear(waiverNumberInput);

    // test record is not approved error occurs
    await userEvent.type(waiverNumberInput, "MD-0002.R00.00");
    const recordIsNotApproved = screen.getByText(
      "According to our records, this Approved Initial or Renewal Waiver Number is not approved. You must supply an approved Initial or Renewal Waiver Number.",
    );
    expect(recordIsNotApproved).toBeInTheDocument();
    await userEvent.clear(waiverNumberInput);

    await userEvent.type(waiverNumberInput, "MD-0000.R00.00");

    expect(waiverNumberLabel).not.toHaveClass("text-destructive");
  });

  test("TEMPORARY EXTENSION REQUEST NUMBER", async () => {
    const requestNumberInput = screen.getByLabelText(
      /Temporary Extension Request Number/,
    );
    const requestNumberLabel = screen.getByTestId("requestNumber-label");

    // invalid TE request format
    await userEvent.type(requestNumberInput, "MD-0000.R00.00");
    const invalidRequestNumberError = screen.getByText(
      "The Temporary Extension Request Number must be in the format of SS-####.R##.TE## or SS-#####.R##.TE##",
    );
    expect(invalidRequestNumberError).toBeInTheDocument();
    await userEvent.clear(requestNumberInput);

    await userEvent.type(requestNumberInput, "MD-0000.R00.TE00");

    expect(requestNumberLabel).not.toHaveClass("text-destructive");
  });

  test("WAIVER EXTENSION REQUEST", async () => {
    const cmsForm179PlanLabel = await upload("waiverExtensionRequest");
    expect(cmsForm179PlanLabel).not.toHaveClass("text-destructive");
  });

  test("submit button is enabled", async () => {
    expect(screen.getByTestId("submit-action-form")).toBeEnabled();
  });
});
