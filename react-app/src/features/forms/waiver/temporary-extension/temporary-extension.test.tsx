import { beforeAll, afterEach, describe, expect, test, vi } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { uploadFiles } from "@/utils/test-helpers/uploadFiles";
import { formSchemas } from "@/formSchemas";
import { TemporaryExtensionForm } from ".";
import {
  renderFormAsync,
  renderFormWithPackageSectionAsync,
} from "@/utils/test-helpers/renderForm";
import { mockApiRefinements, skipCleanup } from "@/utils/test-helpers/skipCleanup";
import {
  EXISTING_ITEM_PENDING_ID,
  EXISTING_ITEM_APPROVED_NEW_ID,
  NOT_FOUND_ITEM_ID,
  VALID_ITEM_TEMPORARY_EXTENSION_ID,
  TEST_ITEM_ID,
} from "mocks";

const upload = uploadFiles<(typeof formSchemas)["temporary-extension"]>();

describe("Temporary Extension", () => {
  beforeAll(() => {
    mockApiRefinements();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  const user = userEvent.setup();

  test("EXISTING WAIVER ID", async () => {
    // set the Item Id to TEST_ITEM_ID
    await renderFormWithPackageSectionAsync(
      <TemporaryExtensionForm />,
      TEST_ITEM_ID,
      "Medicaid SPA",
    );

    const temporaryExtensionValue = await vi.waitUntil(() => screen.getByText("Medicaid SPA"));
    const temporaryExtensionLabel = screen.getByText(/Temporary Extension Type/);

    // ensure Temporary Extension label and value exist and are in correct order
    expect(temporaryExtensionLabel.compareDocumentPosition(temporaryExtensionValue)).toBe(
      Node.DOCUMENT_POSITION_FOLLOWING,
    );

    const approvedInitialAndRenewalLabel = screen.getByText(
      "Approved Initial or Renewal Waiver Number",
    );
    // grab second TEST_ITEM_ID (first one is in the breadcrumbs)
    const approvedInitialAndRenewalValue = screen.getAllByText(TEST_ITEM_ID)[1];

    // ensure Approved Initial and Renewal label and value exist and are in correct order
    expect(
      approvedInitialAndRenewalLabel.compareDocumentPosition(approvedInitialAndRenewalValue),
    ).toBe(Node.DOCUMENT_POSITION_FOLLOWING);
  });

  test("TEMPORARY EXTENSION TYPE", async () => {
    await renderFormAsync(<TemporaryExtensionForm />);

    // enable render cleanup here
    skipCleanup();

    const teTypeDropdown = screen.getByRole("combobox");

    await user.click(teTypeDropdown);

    const teOptionToClick = screen.getByRole("option", {
      name: "1915(b)",
    });

    await user.click(teOptionToClick);

    expect(teTypeDropdown).toHaveTextContent("1915(b)");
  });

  test("APPROVED INITIAL OR RENEWAL WAIVER NUMBER", async () => {
    const waiverNumberInput = screen.getByLabelText(/Approved Initial or Renewal Waiver Number/);
    const waiverNumberLabel = screen.getByTestId("waiverNumber-label");

    // test record does not exist error occurs
    await user.type(waiverNumberInput, NOT_FOUND_ITEM_ID);
    const recordDoesNotExistError = screen.getByText(
      "According to our records, this Approved Initial or Renewal Waiver Number does not yet exist. Please check the Approved Initial or Renewal Waiver Number and try entering it again.",
    );
    expect(recordDoesNotExistError).toBeInTheDocument();
    await user.clear(waiverNumberInput);

    // test record is not approved error occurs
    await user.type(waiverNumberInput, EXISTING_ITEM_PENDING_ID);
    const recordIsNotApproved = screen.getByText(
      "According to our records, this Approved Initial or Renewal Waiver Number is not approved. You must supply an approved Initial or Renewal Waiver Number.",
    );
    expect(recordIsNotApproved).toBeInTheDocument();
    await user.clear(waiverNumberInput);

    await user.type(waiverNumberInput, EXISTING_ITEM_APPROVED_NEW_ID);

    expect(waiverNumberLabel).not.toHaveClass("text-destructive");
  });

  test("TEMPORARY EXTENSION REQUEST NUMBER", async () => {
    const requestNumberInput = screen.getByLabelText(/Temporary Extension Request Number/);
    const requestNumberLabel = screen.getByTestId("requestNumber-label");

    // invalid TE request format
    await user.type(requestNumberInput, EXISTING_ITEM_APPROVED_NEW_ID);
    const invalidRequestNumberError = screen.getByText(
      "The Temporary Extension Request Number must be in the format of SS-####.R##.TE## or SS-#####.R##.TE##",
    );
    expect(invalidRequestNumberError).toBeInTheDocument();
    await user.clear(requestNumberInput);

    await user.type(requestNumberInput, VALID_ITEM_TEMPORARY_EXTENSION_ID);

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
