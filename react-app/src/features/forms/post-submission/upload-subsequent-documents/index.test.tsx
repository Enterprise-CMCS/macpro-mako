import { screen, waitFor } from "@testing-library/react";
import { describe, test, expect, beforeAll, vi } from "vitest";
import { formSchemas } from "@/formSchemas";
import { uploadFiles } from "@/utils/test-helpers/uploadFiles";
import { mockApiRefinements, skipCleanup } from "@/utils/test-helpers/skipCleanup";
import { UploadSubsequentDocuments } from ".";
import userEvent from "@testing-library/user-event";
import { renderFormWithPackageSection } from "@/utils/test-helpers/renderForm";
import { EXISTING_ITEM_APPROVED_NEW_ID } from "mocks";
import * as api from "@/api";

const upload = uploadFiles<(typeof formSchemas)["new-medicaid-submission"]>();
const spy = vi.spyOn(api, "useGetItem");

describe("Upload Subsequent Documents (for Medicaid SPA)", () => {
  beforeAll(async () => {
    skipCleanup();
    mockApiRefinements();

    renderFormWithPackageSection(
      <UploadSubsequentDocuments />,
      EXISTING_ITEM_APPROVED_NEW_ID,
      "Medicaid SPA",
    );
  });

  test("CMS FORM 179", async () => {
    await waitFor(() =>
      expect(spy).toHaveLastReturnedWith(
        expect.objectContaining({
          status: "success",
        }),
      ),
    );
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
