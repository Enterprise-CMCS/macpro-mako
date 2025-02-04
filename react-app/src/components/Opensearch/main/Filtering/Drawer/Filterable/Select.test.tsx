import { describe, expect, it, vi, afterEach } from "vitest";
import { screen, render } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { FilterableSelect } from "./Select";

describe("FilterableSelect", () => {
  const onChange = vi.fn();
  const options = [
    { label: "Apple", value: "Apple" },
    { label: "Banana", value: "Banana" },
    { label: "Clementine", value: "Clementine" },
  ];

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("should display a select box with no chips if value is empty", () => {
    render(<FilterableSelect options={options} value={[]} onChange={onChange} />);
    expect(screen.queryByText("Apple")).toBeNull();
    expect(screen.queryByText("Banana")).toBeNull();
    expect(screen.queryByText("Clementine")).toBeNull();
  });

  it("should display a select box with chips matching the values", () => {
    render(
      <FilterableSelect options={options} value={["Apple", "Clementine"]} onChange={onChange} />,
    );
    expect(screen.queryByText("Apple")).toBeInTheDocument();
    expect(screen.queryByText("Banana")).toBeNull();
    expect(screen.queryByText("Clementine")).toBeInTheDocument();
  });

  it("should handle removing a value", async () => {
    const user = userEvent.setup();
    render(
      <FilterableSelect options={options} value={["Apple", "Clementine"]} onChange={onChange} />,
    );
    expect(screen.queryByText("Apple")).toBeInTheDocument();
    expect(screen.queryByText("Banana")).toBeNull();
    expect(screen.queryByText("Clementine")).toBeInTheDocument();
    await user.click(screen.getByLabelText("Remove Clementine"));
    expect(onChange).toHaveBeenCalledWith(["Apple"]);
  });
});
