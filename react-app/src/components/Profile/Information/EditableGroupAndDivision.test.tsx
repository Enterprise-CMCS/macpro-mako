import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

import { renderWithQueryClient } from "@/utils/test-helpers";

import { EditableGroupAndDivision } from "./EditableGroupAndDivision";

const mockMutate = vi.fn();

afterEach(() => {
  document.querySelectorAll("[data-scroll-lock]").forEach((el) => el.remove());
  document.body.style.overflow = "auto";
  document.body.style.pointerEvents = "auto";
  document.querySelectorAll("[data-radix-portal]").forEach((el) => el.remove());
});

describe("EditableGroupAndDivision", () => {
  const user = userEvent.setup();

  it("should open the dialog when the edit button is clicked", async () => {
    renderWithQueryClient(
      <EditableGroupAndDivision
        group="Group A"
        division="Division 1"
        allowEdits
        email="test@example.com"
      />,
    );

    const editButton = screen.getByRole("button", { name: /edit group and division/i });
    await user.click(editButton);

    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });

  it("should have a disabled submit button until both fields are selected", async () => {
    renderWithQueryClient(<EditableGroupAndDivision allowEdits email="test@example.com" />);

    const editButton = screen.getByRole("button", { name: /edit group and division/i });
    await user.click(editButton);

    const submitButton = screen.getByRole("button", { name: /submit/i });
    expect(submitButton).toBeDisabled();

    await user.click(screen.getByTestId("group-select"));
    await user.click(screen.getByText("DMCO"));

    expect(submitButton).toBeDisabled();
  });

  it("should call the mutation and close the dialog on successful submission", async () => {
    renderWithQueryClient(<EditableGroupAndDivision allowEdits email="test@example.com" />);

    const editButton = screen.getByRole("button", { name: /edit group and division/i });
    await user.click(editButton);

    await user.click(screen.getByTestId("group-select"));
    await user.click(screen.getByText("DMCO"));

    await user.click(screen.getByTestId("division-select"));
    await user.click(screen.getByText("Division of Managed Care Operations"));

    const submitButton = screen.getByRole("button", { name: /submit/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockMutate).toHaveBeenCalledWith({
        group: "DMCO",
        division: "DMCO",
      });
    });
  });

  it("should close the dialog when the cancel button is clicked", async () => {
    renderWithQueryClient(<EditableGroupAndDivision allowEdits email="test@example.com" />);

    const editButton = screen.getByRole("button", { name: /edit group and division/i });
    await user.click(editButton);

    const cancelButton = screen.getByRole("button", { name: /cancel/i });
    await user.click(cancelButton);

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });
});
