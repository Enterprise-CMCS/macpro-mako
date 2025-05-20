import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { ChipDetailsForm } from "./ChipDetails";

// Mock necessary dependencies
vi.mock("react-router", () => ({
  Link: ({ to, children }: any) => <a href={to}>{children}</a>,
}));

vi.mock("@/components", async () => {
  const actual = await vi.importActual<any>("@/components");
  return {
    ...actual,
    ActionForm: ({ title, fields, attachments }: any) => (
      <form>
        <h1>{title}</h1>
        {fields({ control: {} })}
        {attachments &&
          attachments.instructions.map((node: any, i: number) => <div key={i}>{node}</div>)}
      </form>
    ),
    Input: (props: any) => <input {...props} />,
    Select: ({ children }: any) => <div>{children}</div>,
    SelectTrigger: ({ children, ...props }: any) => <button {...props}>{children}</button>,
    SelectValue: ({ children }: any) => <div>{children}</div>,
    SelectContent: ({ children }: any) => <div>{children}</div>,
    Checkbox: ({ checked }: any) => <input type="checkbox" checked={checked} readOnly />,
    DatePicker: ({ onChange }: any) => (
      <input
        type="date"
        data-testid="proposedEffectiveDate"
        onChange={(e) => onChange(new Date(e.target.value))}
      />
    ),
    FormField: ({ render }: any) =>
      render({ field: { onChange: vi.fn(), value: "", ref: vi.fn() } }),
    FormItem: ({ children }: any) => <div>{children}</div>,
    FormLabel: ({ children, ...props }: any) => <label {...props}>{children}</label>,
    FormControl: ({ children }: any) => <div>{children}</div>,
    FormMessage: () => null,
    RequiredIndicator: () => <span>*</span>,
    SpaIdFormattingDesc: () => <div>SPA ID Format Description</div>,
  };
});

vi.mock("@/formSchemas", () => ({
  formSchemas: {
    "new-chip-details-submission": {}, // Provide empty schema or a mock Zod schema if needed
  },
}));

describe("ChipDetailsForm", () => {
  it("renders the form with all major fields", () => {
    render(<ChipDetailsForm />);

    expect(
      screen.getByRole("heading", { name: /CHIP Eligibility SPA Details/i }),
    ).toBeInTheDocument();
    expect(screen.getByTestId("spaid-label")).toHaveTextContent("SPA ID *");
    expect(screen.getByText("CHIP Submission Type")).toBeInTheDocument();
    expect(screen.getByTestId("proposedEffectiveDate")).toBeInTheDocument();
    expect(screen.getAllByTestId("chip-attachments-instructions").length).toBeGreaterThan(0);
  });

  it("shows checkbox options when clicking submission type trigger", () => {
    render(<ChipDetailsForm />);

    const trigger = screen.getByRole("button");
    fireEvent.click(trigger);

    expect(screen.getByText("MAGI Eligibility and Methods")).toBeInTheDocument();
    expect(screen.getByText("Non-Financial Eligibility")).toBeInTheDocument();
    expect(screen.getByText("XXI Medicaid Expansion")).toBeInTheDocument();
    expect(screen.getByText("Eligibility Process")).toBeInTheDocument();
  });

  it("renders attachment section with accepted file types", () => {
    render(<ChipDetailsForm />);
    expect(screen.getByTestId("accepted-files")).toHaveTextContent(".doc, .docx, .pdf");
  });
});
