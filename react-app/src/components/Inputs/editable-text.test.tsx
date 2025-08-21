import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { EditableText } from "./editable-text";

describe("EditableText", () => {
  it("should display the value as text initially", () => {
    render(
      <EditableText label="Test Input" value="Text that can be edited" onValueChange={vi.fn()} />,
    );
    expect(screen.getByText("Text that can be edited")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Edit" })).toBeInTheDocument();
  });

  it("should display the value in an input field, if the edit button is clicked", async () => {
    const user = userEvent.setup();
    render(
      <EditableText label="Test Input" value="Text that can be edited" onValueChange={vi.fn()} />,
    );
    await user.click(screen.getByRole("button", { name: "Edit" }));
    expect(screen.getByLabelText("Test Input")).toBeInTheDocument();
    expect(screen.getByLabelText("Test Input")).toHaveValue("Text that can be edited");
    expect(screen.queryByRole("button", { name: "Edit" })).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Save" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Cancel" })).toBeInTheDocument();
  });

  it("should not call the onValueChanged function, if the Save button is not clicked", async () => {
    const onValueChange = vi.fn();
    const user = userEvent.setup();
    render(
      <EditableText
        label="Test Input"
        value="Text that can be edited"
        onValueChange={onValueChange}
      />,
    );
    await user.click(screen.getByRole("button", { name: "Edit" }));
    await user.type(screen.getByLabelText("Test Input"), "This is a change");
    expect(onValueChange).not.toHaveBeenCalled();
  });

  it("should not call the onValueChanged function and not change the value, if the Cancel button is clicked", async () => {
    const onValueChange = vi.fn();
    const user = userEvent.setup();
    render(
      <EditableText
        label="Test Input"
        value="Text that can be edited"
        onValueChange={onValueChange}
      />,
    );
    await user.click(screen.getByRole("button", { name: "Edit" }));
    await user.type(screen.getByLabelText("Test Input"), "This is a change");
    await user.click(screen.getByRole("button", { name: "Cancel" }));
    expect(onValueChange).not.toHaveBeenCalled();
    await waitFor(() => expect(screen.getByText("Text that can be edited")).toBeInTheDocument());
    expect(screen.queryByText("This is a change")).toBeNull();
  });

  it("should call the onValueChanged function and append the change to the value, if the Save button is clicked", async () => {
    const onValueChange = vi.fn();
    const user = userEvent.setup();
    render(
      <EditableText
        label="Test Input"
        value="Text that can be edited"
        onValueChange={onValueChange}
      />,
    );
    await user.click(screen.getByRole("button", { name: "Edit" }));
    await user.type(screen.getByLabelText("Test Input"), ", and it was");
    await user.click(screen.getByRole("button", { name: "Save" }));
    expect(onValueChange).toHaveBeenCalledWith("Text that can be edited, and it was");
    await waitFor(() =>
      expect(screen.getByText("Text that can be edited, and it was")).toBeInTheDocument(),
    );
  });

  it("should call the onValueChanged function and change the value, if the input was cleared and the Save button is clicked", async () => {
    const onValueChange = vi.fn();
    const user = userEvent.setup();
    render(
      <EditableText
        label="Test Input"
        value="Text that can be edited"
        onValueChange={onValueChange}
      />,
    );
    await user.click(screen.getByRole("button", { name: "Edit" }));
    await user.clear(screen.getByLabelText("Test Input"));
    await user.type(screen.getByLabelText("Test Input"), "This is a change");
    await user.click(screen.getByRole("button", { name: "Save" }));
    expect(onValueChange).toHaveBeenCalledWith("This is a change");
    await waitFor(() => expect(screen.getByText("This is a change")).toBeInTheDocument());
    expect(screen.queryByText("Text that can be edited")).toBeNull();
  });
});
