import { render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import ExpandCollapseButton from "./expandCollapseBtn";

describe("ExpandCollapseBtn", () => {
  it("should display 'Expand all' when areAllOpen is false", () => {
    render(<ExpandCollapseButton expandAll={vi.fn()} collapseAll={vi.fn()} areAllOpen={false} />);

    const button = screen.getByTestId("expand-all");
    expect(button).toHaveTextContent("Expand all");
  });

  it("should display 'Collapse all' when areAllOpen is true", async () => {
    render(<ExpandCollapseButton expandAll={vi.fn()} collapseAll={vi.fn()} areAllOpen={true} />);

    const button = screen.getByTestId("expand-all");

    button.click();
    screen.debug();
    await waitFor(async () => expect(screen.getByText("Collapse all")).toBeInTheDocument());
    expect(button).toHaveTextContent("Collapse all");
  });
});
