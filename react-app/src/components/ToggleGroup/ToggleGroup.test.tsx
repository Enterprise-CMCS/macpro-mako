import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import ToggleGroup from "./ToggleGroup";
import ToggleGroupItem from "./ToggleGroupItem";

describe("ToggleGroup and ToggleGroupItem", () => {
  const handleChange = vi.fn();
  beforeEach(() => {
    render(
      <ToggleGroup
        type="single"
        aria-label="Text alignment"
        value="cms"
        onValueChange={handleChange}
      >
        <ToggleGroupItem value="cms" aria-label="cms">
          CMS
        </ToggleGroupItem>
        <ToggleGroupItem value="states" aria-label="states">
          States
        </ToggleGroupItem>
      </ToggleGroup>,
    );
  });
  it("should render ToggleGroup and ToggleGroupItem correctly", () => {
    expect(screen.getByText("CMS")).toBeInTheDocument();
    expect(screen.getByText("States")).toBeInTheDocument();
  });

  it("should toggle value when a ToggleGroupItem is clicked", () => {
    fireEvent.click(screen.getByText("States"));

    expect(handleChange).toHaveBeenCalledWith("states");
  });

  it("should have data-state=on for the toggleGroup value", () => {
    const cmsItem = screen.getByText("CMS");
    const statesItem = screen.getByText("States");

    expect(cmsItem.getAttribute("data-state")).toBe("on");
    expect(statesItem.getAttribute("data-state")).toBe("off");
  });
});
