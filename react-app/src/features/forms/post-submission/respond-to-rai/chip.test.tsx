import { screen } from "@testing-library/react";
import { describe, expect, beforeAll, test } from "vitest";
import { RespondToRaiChip } from "@/features/forms/post-submission/respond-to-rai";
import { renderFormWithPackageSectionAsync } from "@/utils/test-helpers/renderForm";
import { skipCleanup } from "@/utils/test-helpers/skipCleanup";
import { uploadFiles } from "@/utils/test-helpers/uploadFiles";
import { formSchemas } from "@/formSchemas";
import { EXISTING_ITEM_PENDING_ID } from "mocks";

const upload = uploadFiles<(typeof formSchemas)["respond-to-rai-chip"]>();

describe("Respond To RAI CHIP", () => {
  beforeAll(async () => {
    skipCleanup();
    await renderFormWithPackageSectionAsync(<RespondToRaiChip />, EXISTING_ITEM_PENDING_ID);
  });

  test("REVISED AMENDED STATE PLAN LANGUAGE", async () => {
    const revisedAmendedStatePlanLanguageLabel = await upload("revisedAmendedStatePlanLanguage");
    expect(revisedAmendedStatePlanLanguageLabel).not.toHaveClass("text-destructive");
  });

  test("OFFICIAL RAI RESPONSE", async () => {
    const officialRAIResponseLabel = await upload("officialRAIResponse");
    expect(officialRAIResponseLabel).not.toHaveClass("text-destructive");
  });

  test("submit button is enabled", () => {
    expect(screen.getByTestId("submit-action-form")).toBeEnabled();
  });
});
