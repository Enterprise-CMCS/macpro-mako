import { describe, expect, it, vi, afterEach } from "vitest";
import { screen, render } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { FilterableMultiCheck } from "./Multicheck";

describe("FilterableMultiCheck", () => {
  const onChange = vi.fn();
  const options = [
    { label: "Apple", value: "apple" },
    { label: "Banana", value: "banana" },
    { label: "Clementine", value: "clementine" },
  ];

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("should display all options unchecked if value is empty", () => {
    render(<FilterableMultiCheck value={[]} onChange={onChange} options={options} />);
    expect(screen.getByRole("button", { name: "Select All" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Clear" })).toBeInTheDocument();
    expect(screen.getByLabelText("Apple")).toBeInTheDocument();
    expect(screen.getByLabelText("Apple").getAttribute("data-state")).toEqual("unchecked");
    expect(screen.getByLabelText("Banana")).toBeInTheDocument();
    expect(screen.getByLabelText("Banana").getAttribute("data-state")).toEqual("unchecked");
    expect(screen.getByLabelText("Clementine")).toBeInTheDocument();
    expect(screen.getByLabelText("Clementine").getAttribute("data-state")).toEqual("unchecked");
  });

  it("should display checked options that are in values", () => {
    render(
      <FilterableMultiCheck
        value={["apple", "clementine"]}
        onChange={onChange}
        options={options}
      />,
    );
    expect(screen.getByRole("button", { name: "Select All" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Clear" })).toBeInTheDocument();
    expect(screen.getByLabelText("Apple")).toBeInTheDocument();
    expect(screen.getByLabelText("Apple").getAttribute("data-state")).toEqual("checked");
    expect(screen.getByLabelText("Banana")).toBeInTheDocument();
    expect(screen.getByLabelText("Banana").getAttribute("data-state")).toEqual("unchecked");
    expect(screen.getByLabelText("Clementine")).toBeInTheDocument();
    expect(screen.getByLabelText("Clementine").getAttribute("data-state")).toEqual("checked");
  });

  it("should handle clicking Select All", async () => {
    const user = userEvent.setup();
    render(<FilterableMultiCheck value={[]} onChange={onChange} options={options} />);
    await user.click(screen.getByRole("button", { name: "Select All" }));
    expect(onChange).toHaveBeenCalledWith(["apple", "banana", "clementine"]);
  });

  it("should handle clicking Clear", async () => {
    const user = userEvent.setup();
    render(
      <FilterableMultiCheck
        value={["apple", "banana", "clementine"]}
        onChange={onChange}
        options={options}
      />,
    );
    await user.click(screen.getByRole("button", { name: "Clear" }));
    expect(onChange).toHaveBeenCalledWith([]);
  });
});
