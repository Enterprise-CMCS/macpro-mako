import { screen } from "@testing-library/react";
import { beforeAll, describe, expect, test } from "vitest";
import { WithdrawPackageActionChip } from "@/features/forms/post-submission/withdraw-package";
import { renderFormWithPackageSection } from "@/utils/test-helpers/renderForm";
import { skipCleanup } from "@/utils/test-helpers/skipCleanup";
import { formSchemas } from "@/formSchemas";
import { uploadFiles } from "@/utils/test-helpers/uploadFiles";
import { TEST_ITEM_ID } from "mocks";

const upload = uploadFiles<(typeof formSchemas)["withdraw-package-chip"]>();

describe.skip("Withdraw Package CHIP", () => {
  beforeAll(() => {
    renderFormWithPackageSection(<WithdrawPackageActionChip />, TEST_ITEM_ID, "CHIP SPA");
    skipCleanup();
  });

  test("OFFICIAL WITHDRAWAL LETTER", async () => {
    const officialWithdrawalLetterLabel = await upload("officialWithdrawalLetter");
    expect(officialWithdrawalLetterLabel).not.toHaveClass("text-destructive");
  });

  test("submit button is enabled", () => {
    expect(screen.getByTestId("submit-action-form")).toBeEnabled();
  });
});
