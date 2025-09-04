import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, test, vi } from "vitest";

import { UserPrompt, userPrompt } from "./userPrompt";

describe("userPrompt", () => {
  test("Hidden on initial render", () => {
    const { container } = render(<UserPrompt />);

    expect(container).toBeEmptyDOMElement();

    userPrompt.dismiss();
  });

  test("Create a simple user prompt", async () => {
    const { getByTestId } = render(<UserPrompt />);

    await act(() =>
      userPrompt({
        header: "Testing",
        body: "testing",
        onAccept: vi.fn(),
        onCancel: vi.fn(),
      }),
    );
    screen.debug();

    expect(getByTestId("dialog-content")).toBeInTheDocument();

    userPrompt.dismiss();
  });

  test("User prompt header matches", async () => {
    const { getByTestId } = render(<UserPrompt />);

    await act(() =>
      userPrompt({
        header: "Testing",
        body: "testing body",
        onAccept: vi.fn(),
        onCancel: vi.fn(),
      }),
    );

    expect(getByTestId("dialog-title")).toHaveTextContent("Testing");

    userPrompt.dismiss();
  });

  test("User prompt body matches", async () => {
    const { getByTestId } = render(<UserPrompt />);

    await act(() =>
      userPrompt({
        header: "Testing",
        body: "testing body",
        onAccept: vi.fn(),
        onCancel: vi.fn(),
      }),
    );

    expect(getByTestId("dialog-body")).toHaveTextContent("testing body");

    userPrompt.dismiss();
  });

  test("Custom Accept and Cancel button texts are applied", async () => {
    const { getByTestId } = render(<UserPrompt />);

    await act(() =>
      userPrompt({
        header: "Testing",
        body: "testing body",
        onAccept: vi.fn(),
        onCancel: vi.fn(),
        acceptButtonText: "Custom Accept",
        cancelButtonText: "Custom Cancel",
      }),
    );

    const { children: dialogFooterChildren } = getByTestId("dialog-footer");

    expect(dialogFooterChildren.length).toEqual(2);
    expect(dialogFooterChildren.item(0)).not.toBeNull();
    expect(dialogFooterChildren.item(1)).not.toBeNull();
    expect(dialogFooterChildren.item(0).textContent).toEqual("Custom Accept");
    expect(dialogFooterChildren.item(1).textContent).toEqual("Custom Cancel");

    userPrompt.dismiss();
  });

  test("Clicking Accept successfully closes the user prompt", async () => {
    const user = userEvent.setup();

    const { container, getByTestId } = render(<UserPrompt />);

    await act(() =>
      userPrompt({
        header: "Testing",
        body: "testing body",
        onAccept: vi.fn(),
        onCancel: vi.fn(),
      }),
    );

    user.click(getByTestId("dialog-accept"));

    expect(container).toBeEmptyDOMElement();

    userPrompt.dismiss();
  });

  test("Clicking Cancel successfully closes the user prompt", async () => {
    const user = userEvent.setup();

    const { container, getByTestId } = render(<UserPrompt />);

    await act(() =>
      userPrompt({
        header: "Testing",
        body: "testing body",
        onAccept: vi.fn(),
        onCancel: vi.fn(),
      }),
    );

    await user.click(getByTestId("dialog-cancel"));

    expect(container).toBeEmptyDOMElement();
  });

  test("Clicking Accept successfully calls the onAccept callback", async () => {
    const user = userEvent.setup();

    const { getByTestId } = render(<UserPrompt />);

    const mockOnAccept = vi.fn(() => {});

    await act(() =>
      userPrompt({
        header: "Testing",
        body: "testing body",
        onAccept: mockOnAccept,
        onCancel: vi.fn(),
      }),
    );

    await user.click(getByTestId("dialog-accept"));

    expect(mockOnAccept).toHaveBeenCalled();
  });

  test("Clicking Cancel successfully calls the onCancel callback", async () => {
    const user = userEvent.setup();

    const { getByTestId } = render(<UserPrompt />);

    const mockOnCancel = vi.fn(() => {});

    await act(() =>
      userPrompt({
        header: "Testing",
        body: "testing body",
        onAccept: vi.fn(),
        onCancel: mockOnCancel,
      }),
    );

    await user.click(getByTestId("dialog-cancel"));

    expect(mockOnCancel).toHaveBeenCalled();
  });
});
