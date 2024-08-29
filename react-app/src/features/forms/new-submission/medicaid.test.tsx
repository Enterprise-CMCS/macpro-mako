import { ReactNode } from "react";
import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, test, vi } from "vitest";
import { MedicaidForm } from "./Medicaid";
import { MemoryRouter } from "react-router-dom";
import userEvent from "@testing-library/user-event";
import * as userPrompt from "@/components/ConfirmationDialog/userPrompt";

vi.mock("@/components/Banner");

const wrapper = ({ children }: { children: ReactNode }) => (
  <MemoryRouter>{children}</MemoryRouter>
);

describe("Medicaid SPA form", () => {
  beforeEach(() => {
    render(<MedicaidForm />, { wrapper });
  });

  test("has appropriate title", () => {
    expect(screen.queryByText("Medicaid SPA Details")).toBeInTheDocument();
  });

  test("has special instructions", () => {
    expect(screen.getByTestId("attachments-instructions")).toHaveTextContent(
      "Maximum file size of 80 MB per attachment. You can add multiple files per attachment type except for the CMS Form 179.",
    );
  });

  test("has appropriate FAQ link", () => {
    expect(screen.queryByText("FAQ Page")).toHaveAttribute(
      "href",
      "/faq/medicaid-spa-attachments",
    );
  });

  test("has correct amount of attachments", () => {
    const attachmentsSection = screen.getByTestId("attachments-section");

    expect(attachmentsSection.children).toHaveLength(9);
  });

  test("prompts the user to confirm cancellation with appropriate message", async () => {
    const userPromptSpy = vi.spyOn(userPrompt, "userPrompt");

    userPromptSpy.mockImplementation((args) =>
      args.onAccept ? (args.onAccept = vi.fn()) : undefined,
    );

    const user = userEvent.setup();
    await user.click(screen.getByTestId("cancel-action-form"));

    expect(userPromptSpy).toBeCalledWith({
      header: "Stop form submission?",
      body: "All information you've entered on this form will be lost if you leave this page.",
      acceptButtonText: "Yes, leave form",
      cancelButtonText: "Return to form",
      areButtonsReversed: true,
      onAccept: expect.any(Function),
    });
  });

  test("had a disabled submit button by default", () => {
    expect(screen.getByTestId("submit-action-form")).toBeDisabled();
  });
});
