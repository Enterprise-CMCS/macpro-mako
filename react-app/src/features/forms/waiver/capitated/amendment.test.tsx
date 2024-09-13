import { screen } from "@testing-library/react";
import { beforeAll, describe, expect, test, vi } from "vitest";
import userEvent from "@testing-library/user-event";
import { renderForm } from "@/utils/test-helpers/renderForm";
import { skipCleanup } from "@/utils/test-helpers/skipCleanup";
import { AmendmentForm } from "./Amendment";
import { uploadFiles } from "@/utils/test-helpers/uploadFiles";
import { amendmentFeSchema } from "shared-types/events/capitated-waivers";

vi.mock("@/components/Inputs/upload.utilities", () => ({
  getPresignedUrl: vi.fn(async () => "hello world"),
  uploadToS3: vi.fn(async () => {}),
  extractBucketAndKeyFromUrl: vi.fn(() => ({ bucket: "hello", key: "world" })),
}));

const upload = uploadFiles<typeof amendmentFeSchema>();

let container: HTMLElement;

describe("Capitated Amendment", () => {
  beforeAll(() => {
    skipCleanup();

    const { container: renderedContainer } = renderForm(<AmendmentForm />);

    container = renderedContainer;
  });

  test("EXISTING WAIVER NUMBER TO AMEND", async () => {
    const existingWaiverInput = screen.getByLabelText(
      /Existing Waiver Number to Amend/,
    );
    const existingWaiverLabel = screen.getByTestId("existing-waiver-label");
    await userEvent.type(existingWaiverInput, "MD-24-9291");

    expect(existingWaiverLabel).not.toHaveClass("text-destructive");
  });

  test("1915(B) WAIVER AMENDMENT NUMBER", async () => {
    const waiverAmendmentInput = screen.getByLabelText(
      /Waiver Amendment Number/,
    );
    const waiverAmendmentLabel = screen.getByTestId(
      "1915b-waiver-amendment-label",
    );
    await userEvent.type(waiverAmendmentInput, "SS-8382.R98.01");

    expect(waiverAmendmentLabel).not.toHaveClass("text-destructive");
  });

  test("PROPOSED EFFECTIVE DATE OF 1915(B) WAIVER AMENDMENT", async () => {
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
