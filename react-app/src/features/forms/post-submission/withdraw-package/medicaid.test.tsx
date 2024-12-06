import { screen, waitFor } from "@testing-library/react";
import { beforeAll, describe, expect, test } from "vitest";
import { WithdrawPackageAction } from "@/features/forms/post-submission/withdraw-package";
import { renderFormWithPackageSection } from "@/utils/test-helpers/renderForm";
import { skipCleanup } from "@/utils/test-helpers/skipCleanup";
import { uploadFiles } from "@/utils/test-helpers/uploadFiles";
import { formSchemas } from "@/formSchemas";

const upload = uploadFiles<(typeof formSchemas)["withdraw-package"]>();

describe("Withdraw Package Medicaid & Waiver", () => {
  beforeAll(() => {
    renderFormWithPackageSection(<WithdrawPackageAction />);
    skipCleanup();
  });

  test("SUPPORTING DOCUMENTATION", async () => {
    const supportingDocumentationLabel = await upload("supportingDocumentation");
    expect(supportingDocumentationLabel).not.toHaveClass("text-destructive");
  });

  test("submit button is enabled", async () => {
    await waitFor(() => expect(screen.getByTestId("submit-action-form")).toBeEnabled());
  });
});
