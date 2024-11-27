import { screen, waitFor, waitForElementToBeRemoved } from "@testing-library/react";
import { beforeAll, describe, expect, test } from "vitest";
import { WithdrawPackageAction } from "@/features/forms/post-submission/withdraw-package";
import { renderFormWithPackageSection } from "@/utils/test-helpers/renderForm";
import { skipCleanup } from "@/utils/test-helpers/skipCleanup";
import { uploadFiles } from "@/utils/test-helpers/uploadFiles";
import { formSchemas } from "@/formSchemas";
import { TEST_ITEM_ID } from "mocks";

const upload = uploadFiles<(typeof formSchemas)["withdraw-package"]>();

describe("Withdraw Package Medicaid & Waiver", () => {
  beforeAll(async () => {
    skipCleanup();

    renderFormWithPackageSection(<WithdrawPackageAction />, TEST_ITEM_ID, "Medicaid SPA");
    await waitForElementToBeRemoved(() => screen.getAllByLabelText("three-dots-loading"));
  });

  test("SUPPORTING DOCUMENTATION", async () => {
    const supportingDocumentationLabel = await upload("supportingDocumentation");
    expect(supportingDocumentationLabel).not.toHaveClass("text-destructive");
  });

  test("submit button is enabled", async () => {
    await waitFor(() => expect(screen.getByTestId("submit-action-form")).toBeEnabled());
  });
});
