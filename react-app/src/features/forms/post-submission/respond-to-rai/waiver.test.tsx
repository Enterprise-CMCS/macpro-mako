import { screen } from "@testing-library/react";
import { describe, expect, beforeAll, test } from "vitest";
import { RespondToRaiWaiver } from "@/features/forms/post-submission/respond-to-rai";
import { renderFormWithPackageSectionAsync } from "@/utils/test-helpers/renderForm";
import { skipCleanup } from "@/utils/test-helpers/skipCleanup";
import { uploadFiles } from "@/utils/test-helpers/uploadFiles";
import { formSchemas } from "@/formSchemas";
import { EXISTING_ITEM_PENDING_ID } from "mocks";

const upload = uploadFiles<(typeof formSchemas)["respond-to-rai-waiver"]>();

describe("Respond To RAI Waiver", () => {
  beforeAll(async () => {
    skipCleanup();
    await renderFormWithPackageSectionAsync(
      <RespondToRaiWaiver />,
      EXISTING_ITEM_PENDING_ID,
      "1915(c)",
    );
  });

  test("RAI RESPONSE LETTER WAIVER", async () => {
    const raiResponseLetterWaiverLabel = await upload("raiResponseLetterWaiver");
    expect(raiResponseLetterWaiverLabel).not.toHaveClass("text-destructive");
  });

  test("submit button is enabled", () => {
    expect(screen.getByTestId("submit-action-form")).toBeEnabled();
  });
});
