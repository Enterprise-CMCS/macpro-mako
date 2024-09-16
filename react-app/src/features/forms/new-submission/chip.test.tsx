import userEvent from "@testing-library/user-event";
import { screen } from "@testing-library/react";
import { describe, vi, test, expect, beforeAll } from "vitest";
import { ChipForm } from "./Chip";
import { formSchemas } from "@/formSchemas";
import { uploadFiles } from "@/utils/test-helpers/uploadFiles";
import { renderForm } from "@/utils/test-helpers/renderForm";
import { skipCleanup } from "@/utils/test-helpers/skipCleanup";

const upload = uploadFiles<(typeof formSchemas)["new-chip-submission"]>();

vi.mock("@/components/Inputs/upload.utilities", () => ({
  getPresignedUrl: vi.fn(async () => "hello world"),
  uploadToS3: vi.fn(async () => {}),
  extractBucketAndKeyFromUrl: vi.fn(() => ({ bucket: "hello", key: "world" })),
}));
vi.mock("@/api/itemExists", () => ({
  itemExists: vi.fn(async () => false),
}));
vi.mock("@/utils/user", () => ({
  isAuthorizedState: vi.fn(async () => true),
}));

let container: HTMLElement;

describe("CHIP SPA", () => {
  beforeAll(() => {
    skipCleanup();

    const { container: renderedContainer } = renderForm(<ChipForm />);

    container = renderedContainer;
  });

  test("SPA ID", async () => {
    const spaIdInput = screen.getByLabelText(/SPA ID/);
    await userEvent.type(spaIdInput, "MD-24-9291");
    const spaIdLabel = container.querySelector('[for="id"]');

    expect(spaIdLabel).not.toHaveClass("text-destructive");
  });

  test("PROPOSED EFFECTIVE DATE OF CHIP SPA", async () => {
    await userEvent.click(
      screen.getByTestId("proposedEffectiveDate-datepicker"),
    );
    await userEvent.keyboard("{Enter}");
    const proposedEffectiveDateLabel = container.querySelector(
      '[for="proposedEffectiveDate"]',
    );

    expect(proposedEffectiveDateLabel).not.toHaveClass("text-destructive");
  });

  test("CURRENT STATE PLAN", async () => {
    const currentStatePlanLabel = await upload("currentStatePlan");
    expect(currentStatePlanLabel).not.toHaveClass("text-destructive");
  });

  test("AMENDED STATE PLAN LANGUAGE", async () => {
    const amendedLanguageLabel = await upload("amendedLanguage");
    expect(amendedLanguageLabel).not.toHaveClass("text-destructive");
  });

  test("COVER LETTER", async () => {
    const coverLetterLabel = await upload("coverLetter");
    expect(coverLetterLabel).not.toHaveClass("text-destructive");
  });

  test("submit button is enabled", () => {
    expect(screen.getByTestId("submit-action-form")).toBeEnabled();
  });
});
