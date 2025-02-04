import { RespondToRaiChip } from "@/features/forms/post-submission/respond-to-rai";
import { formSchemas } from "@/formSchemas";
import { renderFormWithPackageSectionAsync } from "@/utils/test-helpers/renderForm";
import { skipCleanup } from "@/utils/test-helpers/skipCleanup";
import { uploadFiles } from "@/utils/test-helpers/uploadFiles";
import { screen } from "@testing-library/react";
import { EXISTING_ITEM_PENDING_ID } from "mocks";
import { beforeAll, describe, expect, test } from "vitest";

const upload = uploadFiles<(typeof formSchemas)["respond-to-rai-chip"]>();

describe("Respond To RAI CHIP", () => {
  beforeAll(async () => {
    skipCleanup();
    await renderFormWithPackageSectionAsync(<RespondToRaiChip />, EXISTING_ITEM_PENDING_ID);
  });

  test("revised amended state plan language", async () => {
    const revisedAmendedStatePlanLanguageLabel = await upload("revisedAmendedStatePlanLanguage");
    expect(revisedAmendedStatePlanLanguageLabel).not.toHaveClass("text-destructive");
  });

  test("official RAI response", async () => {
    const officialRAIResponseLabel = await upload("officialRAIResponse");
    expect(officialRAIResponseLabel).not.toHaveClass("text-destructive");
  });

  test("submit button is enabled", () => {
    expect(screen.getByTestId("submit-action-form")).toBeEnabled();
  });
});
