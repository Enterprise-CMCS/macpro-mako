import { screen, waitFor, waitForElementToBeRemoved } from "@testing-library/react";
import { describe, test, expect, beforeAll } from "vitest";
import { formSchemas } from "@/formSchemas";
import { uploadFiles } from "@/utils/test-helpers/uploadFiles";
import { mockApiRefinements, skipCleanup } from "@/utils/test-helpers/skipCleanup";
import { UploadSubsequentDocuments } from ".";
import userEvent from "@testing-library/user-event";
import { renderFormWithPackageSection } from "@/utils/test-helpers/renderForm";
import { TEST_ITEM_ID } from "mocks";

const upload = uploadFiles<(typeof formSchemas)["new-medicaid-submission"]>();

describe("Upload Subsequent Documents (for Medicaid SPA)", () => {
  beforeAll(async () => {
    skipCleanup();
    mockApiRefinements();

    renderFormWithPackageSection(<UploadSubsequentDocuments />, TEST_ITEM_ID, "Medicaid SPA");
    await waitForElementToBeRemoved(() => screen.getByLabelText("three-dots-loading"));
  });

  test("CMS FORM 179", async () => {
    const currentStatePlanLabel = await upload("cmsForm179");
    expect(currentStatePlanLabel).not.toHaveClass("text-destructive");
  });

  test.skip("ADDITIONAL INFORMATION", async () => {
    const additionalInfoInput = screen.getByLabelText(
      /Explain why additional documents are being submitted/,
    );
    const additionalInfoLabel = screen.getByTestId("addl-info-label");

    await userEvent.type(additionalInfoInput, "this is additional information in the test");

    expect(additionalInfoLabel).not.toHaveClass("text-destructive");
  });

  test.skip("submit button is enabled", async () => {
    waitFor(() => expect(screen.getByTestId("submit-action-form")).toBeEnabled());
  });
});
