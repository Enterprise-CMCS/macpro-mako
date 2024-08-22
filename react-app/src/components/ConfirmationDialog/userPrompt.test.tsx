import { act, render, waitFor } from "@testing-library/react";
import { describe, expect, test, vi } from "vitest";
import { UserPrompt, userPrompt } from "./userPrompt";
import userEvent from "@testing-library/user-event";

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

describe("userPrompt", () => {
  test("Hidden on initial render", () => {
    const { container } = render(<UserPrompt />);

    expect(container).toBeEmptyDOMElement();
  });

  test("Create a simple user prompt", async () => {
    const { getByTestId } = render(<UserPrompt />);

    await act(async () => {
      userPrompt({
        header: "Testing",
        body: "testing",
        onAccept: vi.fn(),
      });
      await delay(0);
    });

    expect(getByTestId("dialog-content")).toBeInTheDocument();
  });

  test("User prompt header matches", async () => {
    const { getByTestId } = render(<UserPrompt />);

    await act(async () => {
      userPrompt({
        header: "Testing",
        body: "testing body",
        onAccept: vi.fn(),
      });
      await delay(0);
    });

    expect(getByTestId("dialog-title")).toHaveTextContent("Testing");
  });

  test("User prompt body matches", async () => {
    const { getByTestId } = render(<UserPrompt />);

    await act(async () => {
      userPrompt({
        header: "Testing",
        body: "testing body",
        onAccept: vi.fn(),
      });
      await delay(0);
    });

    expect(getByTestId("dialog-body")).toHaveTextContent("testing body");
  });

  test("Clicking Accept successfully closes the user prompt", async () => {
    const user = userEvent.setup();

    const { container, getByTestId } = render(<UserPrompt />);

    await act(async () => {
      userPrompt({
        header: "Testing",
        body: "testing body",
        onAccept: vi.fn(),
      });
      await delay(0);
    });

    await user.click(getByTestId("dialog-accept"));
    await waitFor(() => expect(container).toBeEmptyDOMElement());
  });

  test("Clicking Cancel successfully closes the user prompt", async () => {
    const user = userEvent.setup();

    const { container, getByTestId } = render(<UserPrompt />);

    await act(async () => {
      userPrompt({
        header: "Testing",
        body: "testing body",
        onAccept: vi.fn(),
      });
      await delay(0);
    });

    await user.click(getByTestId("dialog-cancel"));
    await waitFor(() => expect(container).toBeEmptyDOMElement());
  });

  test("Clicking Accept successfully calls the onAccept callback", async () => {
    const user = userEvent.setup();

    const { getByTestId } = render(<UserPrompt />);

    const mockOnAccept = vi.fn(() => {});

    await act(async () => {
      userPrompt({
        header: "Testing",
        body: "testing body",
        onAccept: mockOnAccept,
      });
      await delay(0);
    });

    await user.click(getByTestId("dialog-accept"));
    await waitFor(() => expect(mockOnAccept).toHaveBeenCalled());
  });

  test("Clicking Cancel successfully calls the onCancel callback", async () => {
    const user = userEvent.setup();

    const { getByTestId } = render(<UserPrompt />);

    const mockOnCancel = vi.fn(() => {});

    await act(async () => {
      userPrompt({
        header: "Testing",
        body: "testing body",
        onAccept: vi.fn(),
        onCancel: mockOnCancel,
      });
      await delay(0);
    });

    await user.click(getByTestId("dialog-cancel"));
    await waitFor(() => expect(mockOnCancel).toHaveBeenCalled());
  });

  test("Custom Accept and Cancel button texts are applied", async () => {
    const { getByTestId } = render(<UserPrompt />);

    await act(async () => {
      userPrompt({
        header: "Testing",
        body: "testing body",
        onAccept: vi.fn(),
        acceptButtonText: "Custom Accept",
        cancelButtonText: "Custom Cancel",
      });
      await delay(0);
    });

    const { children: dialogFooterChildren } = getByTestId("dialog-footer");

    expect(dialogFooterChildren.item(0).textContent).toEqual("Custom Accept");
    expect(dialogFooterChildren.item(1).textContent).toEqual("Custom Cancel");
  });
});
