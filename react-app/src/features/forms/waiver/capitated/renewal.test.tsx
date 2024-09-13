import { screen } from "@testing-library/react";
import { beforeAll, describe, expect, test, vi } from "vitest";
import userEvent from "@testing-library/user-event";
import { renderForm } from "@/utils/test-helpers/renderForm";
import { skipCleanup } from "@/utils/test-helpers/skipCleanup";
import { Renewal } from "./Renewal";
import { uploadFiles } from "@/utils/test-helpers/uploadFiles";
import { formSchemas } from "@/formSchemas";

vi.mock("@/components/Inputs/upload.utilities", () => ({
  getPresignedUrl: vi.fn(async () => "hello world"),
  uploadToS3: vi.fn(async () => {}),
  extractBucketAndKeyFromUrl: vi.fn(() => ({ bucket: "hello", key: "world" })),
}));

const upload = uploadFiles<(typeof formSchemas)["capitated-renewal"]>();

let container: HTMLElement;

describe("Capitated Renewal", () => {
  beforeAll(() => {
    skipCleanup();

    const { container: renderedContainer } = renderForm(<Renewal />);

    container = renderedContainer;
  });

  test("EXISTING RENEWAL NUMBER TO RENEW", async () => {
    const existingWaiverInput = screen.getByLabelText(
      /Existing Waiver Number to Renew/,
    );
    const existingWaiverLabel = screen.getByTestId("existing-waiver-label");
    await userEvent.type(existingWaiverInput, "MD-24-9291");

    expect(existingWaiverLabel).not.toHaveClass("text-destructive");
  });

  test("1915(B) WAIVER RENEWAL NUMBER", async () => {
    const waiverRenewalInput = screen.getByLabelText(/Waiver Renewal Number/);
    const waiverRenewalLabel = screen.getByTestId("1915b-waiver-renewal-label");
    await userEvent.type(waiverRenewalInput, "SS-8382.R98.01");

    expect(waiverRenewalLabel).not.toHaveClass("text-destructive");
  });

  test("PROPOSED EFFECTIVE DATE OF 1915(B) WAIVER RENEWAL", async () => {
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
