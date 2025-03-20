import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import ToggleGroup from "./ToggleGroup";
import ToggleGroupItem from "./ToggleGroupItem";

describe("ToggleGroup and ToggleGroupItem", () => {
  it("should render ToggleGroup and ToggleGroupItem correctly", () => {
    render(
      <ToggleGroup type="single" aria-label="Text alignment" value="cms" onValueChange={vi.fn()}>
        <ToggleGroupItem value="cms" aria-label="cms">
          CMS
        </ToggleGroupItem>
        <ToggleGroupItem value="state" aria-label="state">
          States
        </ToggleGroupItem>
      </ToggleGroup>,
    );

    expect(screen.getByText("CMS")).toBeInTheDocument();
    expect(screen.getByText("States")).toBeInTheDocument();
  });

  it("should toggle value when a ToggleGroupItem is clicked", () => {
    const handleChange = vi.fn();

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
        <ToggleGroupItem value="state" aria-label="state">
          States
        </ToggleGroupItem>
      </ToggleGroup>,
    );

    fireEvent.click(screen.getByText("States"));

    expect(handleChange).toHaveBeenCalledWith("state");
  });

  it("should apply active styles correctly when a ToggleGroupItem is active", () => {
    render(
      <ToggleGroup type="single" aria-label="Text alignment" value="cms" onValueChange={vi.fn()}>
        <ToggleGroupItem value="cms" aria-label="cms">
          CMS
        </ToggleGroupItem>
        <ToggleGroupItem value="state" aria-label="state">
          States
        </ToggleGroupItem>
      </ToggleGroup>,
    );

    const cmsItem = screen.getByText("CMS");
    const stateItem = screen.getByText("States");

    expect(cmsItem).toHaveClass("data-[state=on]:border-b-primary-dark");
    expect(cmsItem).toHaveClass("data-[state=on]:bg-blue-50");

    fireEvent.click(stateItem);

    expect(cmsItem).not.toHaveClass("data-[state=on]:border-b-primary-dark");
    expect(stateItem).toHaveClass("data-[state=on]:border-b-primary-dark");
    expect(stateItem).toHaveClass("data-[state=on]:bg-blue-50");
  });

  it("should not apply active styles if not selected", () => {
    render(
      <ToggleGroup type="single" aria-label="Text alignment" value="cms" onValueChange={vi.fn()}>
        <ToggleGroupItem value="cms" aria-label="cms">
          CMS
        </ToggleGroupItem>
        <ToggleGroupItem value="state" aria-label="state">
          States
        </ToggleGroupItem>
      </ToggleGroup>,
    );

    const cmsItem = screen.getByText("CMS");
    const stateItem = screen.getByText("States");

    expect(cmsItem).toHaveClass("data-[state=on]:border-b-primary-dark");
    expect(stateItem).not.toHaveClass("data-[state=on]:border-b-primary-dark");
  });
});
