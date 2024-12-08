import { beforeAll, describe, expect, test, vi } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { uploadFiles } from "@/utils/test-helpers/uploadFiles";
import { formSchemas } from "@/formSchemas";
import { TemporaryExtensionForm } from ".";
import { renderForm, renderFormWithPackageSection } from "@/utils/test-helpers/renderForm";
import { mockApiRefinements, skipCleanup } from "@/utils/test-helpers/skipCleanup";
import * as api from "@/api";

const upload = uploadFiles<(typeof formSchemas)["temporary-extension"]>();

describe("Temporary Extension", () => {
  beforeAll(() => {
    mockApiRefinements();
  });

  test("EXISTING WAIVER ID", () => {
    renderFormWithPackageSection(<TemporaryExtensionForm />);

    // "Medicaid SPA" comes from `useGetItem` in testing/setup.ts
    const temporaryExtensionLabel = screen.getByText(/Temporary Extension Type/);
    const temporaryExtensionValue = screen.getByText("Medicaid SPA");

    // ensure Temporary Extension label and value exist and are in correct order
    expect(temporaryExtensionLabel.compareDocumentPosition(temporaryExtensionValue)).toBe(
      Node.DOCUMENT_POSITION_FOLLOWING,
    );

    const approvedInitialAndRenewalLabel = screen.getByText(
      "Approved Initial or Renewal Waiver Number",
    );
    // grab second 12345 (first one is in the breadcrumbs)
    const approvedInitialAndRenewalValue = screen.getAllByText(/12345/)[1];

    // ensure Approved Initial and Renewal label and value exist and are in correct order
    expect(
      approvedInitialAndRenewalLabel.compareDocumentPosition(approvedInitialAndRenewalValue),
    ).toBe(Node.DOCUMENT_POSITION_FOLLOWING);
  });

  test("TEMPORARY EXTENSION TYPE", async () => {
    // mock `useGetItem` to signal there's temp-ext submission to render
    // @ts-ignore - expects the _whole_ React-Query object (annoying to type out)
    vi.spyOn(api, "useGetItem").mockImplementation(() => ({ data: undefined }));
    // render temp-ext form with no route params
    renderForm(<TemporaryExtensionForm />);
    // enable render cleanup here
    skipCleanup();

    const teTypeDropdown = screen.getByRole("combobox");

    await userEvent.click(teTypeDropdown);

    const teOptionToClick = screen.getByRole("option", {
      name: "1915(b)",
    });

    await userEvent.click(teOptionToClick);

    expect(teTypeDropdown).toHaveTextContent("1915(b)");
  });

  test("APPROVED INITIAL OR RENEWAL WAIVER NUMBER", async () => {
    const waiverNumberInput = screen.getByLabelText(/Approved Initial or Renewal Waiver Number/);
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
    const requestNumberInput = screen.getByLabelText(/Temporary Extension Request Number/);
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
