import { screen } from "@testing-library/react";
import { describe, expect, beforeAll, test } from "vitest";
import { RespondToRaiMedicaid } from "@/features/forms/post-submission/respond-to-rai";
import { renderFormWithPackageSectionAsync } from "@/utils/test-helpers/renderForm";
import { skipCleanup } from "@/utils/test-helpers/skipCleanup";
import { uploadFiles } from "@/utils/test-helpers/uploadFiles";
import { formSchemas } from "@/formSchemas";
import { EXISTING_ITEM_PENDING_ID } from "mocks";

const upload = uploadFiles<(typeof formSchemas)["respond-to-rai-medicaid"]>();

describe("Respond To RAI Medicaid", () => {
  beforeAll(async () => {
    skipCleanup();
    await renderFormWithPackageSectionAsync(<RespondToRaiMedicaid />, EXISTING_ITEM_PENDING_ID);
  });

  test("RAI RESPONSE LETTER", async () => {
    const raiResponseLetterLabel = await upload("raiResponseLetter");
    expect(raiResponseLetterLabel).not.toHaveClass("text-destructive");
  });

  test("submit button is enabled", () => {
    expect(screen.getByTestId("submit-action-form")).toBeEnabled();
  });
});
