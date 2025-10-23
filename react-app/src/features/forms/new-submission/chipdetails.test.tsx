import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it } from "vitest";

import { mockApiRefinements, renderFormWithPackageSectionAsync } from "@/utils/test-helpers";

import { ChipDetailsForm } from "./ChipDetails";

describe("ChipDetailsForm", () => {
  beforeEach(async () => {
    mockApiRefinements();
    await renderFormWithPackageSectionAsync(<ChipDetailsForm />);
  });

  it("renders the form with all major fields", () => {
    expect(
      screen.getByRole("heading", { name: /CHIP Eligibility SPA Details/i }),
    ).toBeInTheDocument();
    expect(screen.getByTestId("spaid-label")).toHaveTextContent("SPA ID *");
    expect(screen.getByText("CHIP Submission Type")).toBeInTheDocument();
    expect(screen.getByTestId("proposedEffectiveDate-datepicker")).toBeInTheDocument();
    expect(screen.getAllByTestId("chip-attachments-instructions").length).toBeGreaterThan(0);
  });

  it("shows checkbox options when clicking submission type trigger", async () => {
    const trigger = screen.getByRole("combobox");
    await userEvent.click(trigger);

    expect(await screen.findByText("MAGI Eligibility and Methods")).toBeInTheDocument();
    expect(await screen.findByText("Non-Financial Eligibility")).toBeInTheDocument();
    expect(await screen.findByText("XXI Medicaid Expansion")).toBeInTheDocument();
    expect(await screen.findByText("Eligibility Process")).toBeInTheDocument();
  });

  it("renders attachment section with accepted file types", () => {
    expect(screen.getByTestId("accepted-files")).toHaveTextContent(".doc, .docx, .pdf");
  });
});
