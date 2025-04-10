import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { Switch } from "./switch";

describe("Switch", () => {
  it("should render", () => {
    render(<Switch />);
    expect(screen.getByRole("switch")).toBeInTheDocument();
  });

  it("should call onChange and onCheckedChange when state changes", () => {
    const onChange = vi.fn();
    const onCheckedChange = vi.fn();

    render(<Switch onChange={onChange} onCheckedChange={onCheckedChange} />);

    const switchElement = screen.getByRole("switch");
    fireEvent.click(switchElement);

    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onCheckedChange).toHaveBeenCalledTimes(1);
  });
});
