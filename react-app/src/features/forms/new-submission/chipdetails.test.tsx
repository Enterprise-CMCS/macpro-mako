import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SEATOOL_STATUS } from "shared-types";
import { beforeEach, describe, expect, it, vi } from "vitest";

import * as api from "@/api";
import { mockApiRefinements, renderFormWithPackageSectionAsync } from "@/utils/test-helpers";

import { ChipDetailsForm } from "./ChipDetails";
import { NEW_SUBMISSION_FORM_DESCRIPTION, NEW_SUBMISSION_PROGRESS_LOSS_REMINDER } from "./content";

describe("ChipDetailsForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockApiRefinements();
    vi.spyOn(api, "itemExists").mockResolvedValue(false);
  });

  it("renders the form with all major fields", async () => {
    await renderFormWithPackageSectionAsync(<ChipDetailsForm />);

    expect(
      screen.getByRole("heading", { name: /CHIP Eligibility SPA Details/i }),
    ).toBeInTheDocument();
    expect(screen.getByTestId("spaid-label")).toHaveTextContent("SPA ID *");
    expect(screen.getByText("CHIP Submission Type")).toBeInTheDocument();
    expect(screen.getByTestId("proposedEffectiveDate-datepicker")).toBeInTheDocument();
    expect(screen.getAllByTestId("chip-attachments-instructions").length).toBeGreaterThan(0);
    expect(screen.getByTestId("detail-section")).toHaveTextContent(NEW_SUBMISSION_FORM_DESCRIPTION);
    expect(screen.getByTestId("detail-section")).toHaveTextContent(
      NEW_SUBMISSION_PROGRESS_LOSS_REMINDER,
    );
  });

  it("shows checkbox options when clicking submission type trigger", async () => {
    await renderFormWithPackageSectionAsync(<ChipDetailsForm />);

    const trigger = screen.getByRole("combobox");
    await userEvent.click(trigger);

    expect(await screen.findByText("MAGI Eligibility and Methods")).toBeInTheDocument();
    expect(await screen.findByText("Non-Financial Eligibility")).toBeInTheDocument();
    expect(await screen.findByText("XXI Medicaid Expansion")).toBeInTheDocument();
    expect(await screen.findByText("Eligibility Process")).toBeInTheDocument();
  });

  it("renders attachment section with accepted file types", async () => {
    await renderFormWithPackageSectionAsync(<ChipDetailsForm />);

    expect(screen.getByTestId("accepted-files")).toHaveTextContent(".doc, .docx, .pdf");
  });

  it("keeps CHIP Submission Type enabled for an unlocked draft", async () => {
    const draftId = "MD-25-0003-IJJJ";
    vi.spyOn(api, "useGetItem").mockReturnValue({
      data: {
        _id: draftId,
        found: true,
        _source: {
          id: draftId,
          seatoolStatus: SEATOOL_STATUS.DRAFT,
          draft: {
            savedAt: "2026-03-26T00:00:00.000Z",
            data: { id: draftId },
          },
        },
      },
      isLoading: false,
      error: null,
    } as any);

    await renderFormWithPackageSectionAsync(
      <ChipDetailsForm />,
      undefined,
      "CHIP SPA",
      `draftId=${draftId}`,
    );

    expect(screen.getByRole("combobox")).not.toBeDisabled();
  });

  it("keeps CHIP Submission Type enabled when a draft ID conflict exists", async () => {
    const user = userEvent.setup();
    const draftId = "MD-25-0003-IJJJ";
    vi.spyOn(api, "useGetItem").mockReturnValue({
      data: {
        _id: draftId,
        found: true,
        _source: {
          id: draftId,
          seatoolStatus: SEATOOL_STATUS.DRAFT,
          draft: {
            savedAt: "2026-03-26T00:00:00.000Z",
            data: { id: draftId },
          },
        },
      },
      isLoading: false,
      error: null,
    } as any);
    vi.mocked(api.itemExists).mockResolvedValue(true);

    await renderFormWithPackageSectionAsync(
      <ChipDetailsForm />,
      undefined,
      "CHIP SPA",
      `draftId=${draftId}`,
    );

    expect(screen.queryByText("This package is locked")).not.toBeInTheDocument();
    expect(screen.getByRole("combobox")).not.toBeDisabled();
    await user.click(screen.getByRole("combobox"));
    expect(await screen.findByText("MAGI Eligibility and Methods")).toBeInTheDocument();
  });
});
