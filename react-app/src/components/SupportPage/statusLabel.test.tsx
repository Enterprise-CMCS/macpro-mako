import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import StatusLabel from "./statusLabel";

describe("StatusLabel Component", () => {
  it('should render with correct text and background color for "New" type', () => {
    render(<StatusLabel type="New" />);
    const label = screen.getByText("New");
    expect(label).toBeInTheDocument();
    expect(label).toHaveClass("bg-blue-700");
  });

  it('should render with correct text and background color for "Updated" type', () => {
    render(<StatusLabel type="Updated" />);
    const label = screen.getByText("Updated");
    expect(label).toBeInTheDocument();
    expect(label).toHaveClass("bg-green-700");
  });
});
