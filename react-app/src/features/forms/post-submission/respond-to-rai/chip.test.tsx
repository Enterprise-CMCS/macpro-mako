import { screen } from "@testing-library/react";
import { describe, expect, beforeAll, test } from "vitest";
import { RespondToRaiChip } from "@/features/forms/post-submission/respond-to-rai";
import { renderFormWithPackageSection } from "@/utils/test-helpers/renderForm";
import { skipCleanup } from "@/utils/test-helpers/skipCleanup";
import { uploadFiles } from "@/utils/test-helpers/uploadFiles";
import { formSchemas } from "@/formSchemas";

const upload = uploadFiles<(typeof formSchemas)["respond-to-rai-chip"]>();

describe("Respond To RAI CHIP", () => {
  beforeAll(() => {
    renderFormWithPackageSection(<RespondToRaiChip />);
    skipCleanup();
  });

  test("REVISED AMENDED STATE PLAN LANGUAGE", async () => {
    const revisedAmendedStatePlanLanguageLabel = await upload(
      "revisedAmendedStatePlanLanguage",
    );
    expect(revisedAmendedStatePlanLanguageLabel).not.toHaveClass(
      "text-destructive",
    );
  });

  test("OFFICIAL RAI RESPONSE", async () => {
    const officialRAIResponseLabel = await upload("officialRAIResponse");
    expect(officialRAIResponseLabel).not.toHaveClass("text-destructive");
  });

  test("submit button is enabled", () => {
    expect(screen.getByTestId("submit-action-form")).toBeEnabled();
  });
});
