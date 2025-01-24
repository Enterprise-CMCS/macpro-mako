import { describe, expect, it, vi, afterEach } from "vitest";
import { screen, render } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { FilterableBoolean } from "./Boolean";

describe("FilterableBoolean", () => {
  const onChange = vi.fn();

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("should display no checked boxes for null value", () => {
    render(<FilterableBoolean value={null} onChange={onChange} />);
    expect(screen.getByLabelText("Yes").getAttribute("data-state")).toEqual("unchecked");
    expect(screen.getByLabelText("No").getAttribute("data-state")).toEqual("unchecked");
  });

  it("should display the Yes box checked for true value", () => {
    render(<FilterableBoolean value={true} onChange={onChange} />);
    expect(screen.getByLabelText("Yes").getAttribute("data-state")).toEqual("checked");
    expect(screen.getByLabelText("No").getAttribute("data-state")).toEqual("unchecked");
  });

  it("should display the No box checked for false value", () => {
    render(<FilterableBoolean value={false} onChange={onChange} />);
    expect(screen.getByLabelText("Yes").getAttribute("data-state")).toEqual("unchecked");
    expect(screen.getByLabelText("No").getAttribute("data-state")).toEqual("checked");
  });

  it("should handle clicking Yes if value is null", async () => {
    const user = userEvent.setup();
    render(<FilterableBoolean value={null} onChange={onChange} />);
    await user.click(screen.getByLabelText("Yes"));
    expect(onChange).toHaveBeenCalledWith(true);
  });

  it("should handle clicking Yes if value is true", async () => {
    const user = userEvent.setup();
    render(<FilterableBoolean value={true} onChange={onChange} />);
    await user.click(screen.getByLabelText("Yes"));
    expect(onChange).toHaveBeenCalledWith(null);
  });

  it("should handle clicking No if value is null", async () => {
    const user = userEvent.setup();
    render(<FilterableBoolean value={null} onChange={onChange} />);
    await user.click(screen.getByLabelText("No"));
    expect(onChange).toHaveBeenCalledWith(false);
  });

  it("should handle clicking No if value is false", async () => {
    const user = userEvent.setup();
    render(<FilterableBoolean value={false} onChange={onChange} />);
    await user.click(screen.getByLabelText("No"));
    expect(onChange).toHaveBeenCalledWith(null);
  });

  it("should handle clicking Yes if value is false", async () => {
    const user = userEvent.setup();
    render(<FilterableBoolean value={false} onChange={onChange} />);
    await user.click(screen.getByLabelText("Yes"));
    expect(onChange).toHaveBeenCalledWith(true);
  });

  it("should handle clicking No if value is true", async () => {
    const user = userEvent.setup();
    render(<FilterableBoolean value={true} onChange={onChange} />);
    await user.click(screen.getByLabelText("No"));
    expect(onChange).toHaveBeenCalledWith(false);
  });
});
