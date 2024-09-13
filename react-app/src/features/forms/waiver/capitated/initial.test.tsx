import { screen } from "@testing-library/react";
import { beforeAll, describe, expect, test, vi } from "vitest";
import userEvent from "@testing-library/user-event";
import { renderForm } from "@/utils/test-helpers/renderForm";
import { skipCleanup } from "@/utils/test-helpers/skipCleanup";
import { InitialForm } from "./Initial";
import { uploadFiles } from "@/utils/test-helpers/uploadFiles";
import { formSchemas } from "@/formSchemas";

vi.mock("@/components/Inputs/upload.utilities", () => ({
  getPresignedUrl: vi.fn(async () => "hello world"),
  uploadToS3: vi.fn(async () => {}),
  extractBucketAndKeyFromUrl: vi.fn(() => ({ bucket: "hello", key: "world" })),
}));

const upload = uploadFiles<(typeof formSchemas)["capitated-initial"]>();

let container: HTMLElement;

describe("Capitated Initial", () => {
  beforeAll(() => {
    skipCleanup();

    const { container: renderedContainer } = renderForm(<InitialForm />);

    container = renderedContainer;
  });

  test("1915(B) WAIVER NUMBER", async () => {
    const waiverInitialInput = screen.getByLabelText(/Initial Waiver Number/);
    const waiverInitialLabel = screen.getByTestId("1915b-waiver-initial-label");
    await userEvent.type(waiverInitialInput, "SS-8382.R98.01");

    expect(waiverInitialLabel).not.toHaveClass("text-destructive");
  });

  test("PROPOSED EFFECTIVE DATE OF 1915(B) WAIVER INITIAL", async () => {
    await userEvent.click(
      screen.getByTestId("proposedEffectiveDate-datepicker"),
    );
    await userEvent.keyboard("{Enter}");
    const proposedEffectiveDateLabel = container.querySelector(
      '[for="proposedEffectiveDate"]',
    );

    expect(proposedEffectiveDateLabel).not.toHaveClass("text-destructive");
  });

  test("1915(B) COMPREHENSIVE (CAPITATED) WAIVER APPLICATION PRE-PRINT", async () => {
    const appPrePrint = await upload("bCapWaiverApplication");
    expect(appPrePrint).not.toHaveClass("text-destructive");
  });

  test("1915(B) COMPREHENSIVE (CAPITATED) WAIVER COST EFFECTIVENESS SPREADSHEETS", async () => {
    const costEffectivenessSpreadsheets = await upload("bCapCostSpreadsheets");
    expect(costEffectivenessSpreadsheets).not.toHaveClass("text-destructive");
  });

  test("submit button is enabled", () => {
    expect(screen.getByTestId("submit-action-form")).toBeEnabled();
  });
});
