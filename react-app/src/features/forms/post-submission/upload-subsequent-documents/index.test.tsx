import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { TEST_ITEM_ID } from "mocks";
import { beforeAll, describe, expect, test } from "vitest";

import { formSchemas } from "@/formSchemas";
import { renderFormWithPackageSectionAsync } from "@/utils/test-helpers/renderForm";
import { mockApiRefinements, skipCleanup } from "@/utils/test-helpers/skipCleanup";
import { uploadFiles } from "@/utils/test-helpers/uploadFiles";

import { UploadSubsequentDocuments } from ".";

const upload = uploadFiles<(typeof formSchemas)["new-medicaid-submission"]>();

describe("Upload Subsequent Documents (for Medicaid SPA)", () => {
  beforeAll(async () => {
    skipCleanup();
    mockApiRefinements();

    await renderFormWithPackageSectionAsync(<UploadSubsequentDocuments />, TEST_ITEM_ID);
  });

  test("CMS FORM 179", async () => {
    const currentStatePlanLabel = await upload("cmsForm179");
    expect(currentStatePlanLabel).not.toHaveClass("text-destructive");
  });

  test("ADDITIONAL INFORMATION", async () => {
    const additionalInfoInput = screen.getByTestId("additional-info-input");
    const additionalInfoLabel = screen.getByTestId("addl-info-label");

    await userEvent.type(additionalInfoInput, "this is additional information in the test");

    expect(additionalInfoLabel).not.toHaveClass("text-destructive");
  });

  test("submit button is enabled", async () => {
    waitFor(() => expect(screen.getByTestId("submit-action-form")).toBeEnabled());
  });
});
