import { describe, expect, it, vi, afterEach } from "vitest";
import { screen, render, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { FilterableDateRange } from "./DateRange";
import { format, startOfQuarter, startOfMonth, sub, endOfDay, startOfDay, getDate } from "date-fns";
import { offsetToUtc } from "shared-utils";

describe("FilterableDateRange", () => {
  const onChange = vi.fn();

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("should display the placeholder text if there is no value", () => {
    render(<FilterableDateRange value={{ gte: undefined, lte: undefined }} onChange={onChange} />);
    expect(screen.getByText("Pick a date")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Clear" })).toBeInTheDocument();
  });

  it("should not display date if value is only to date", () => {
    render(
      <FilterableDateRange value={{ gte: undefined, lte: "01/01/2025" }} onChange={onChange} />,
    );
    expect(screen.getByText("Pick a date")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Clear" })).toBeInTheDocument();
  });

  it("should display from date if value is only from date", () => {
    render(
      <FilterableDateRange value={{ gte: "01/01/2025", lte: undefined }} onChange={onChange} />,
    );
    expect(screen.getByText("Jan 01, 2025")).toBeInTheDocument();
  });

  it("should display from and to date if value has both", () => {
    render(
      <FilterableDateRange value={{ gte: "01/01/2025", lte: "03/31/2025" }} onChange={onChange} />,
    );
    expect(screen.getByText("Jan 01, 2025 - Mar 30, 2025")).toBeInTheDocument();
  });

  it("should handle clicking the Clear button", async () => {
    const user = userEvent.setup();
    render(
      <FilterableDateRange value={{ gte: "01/01/2025", lte: "03/31/2025" }} onChange={onChange} />,
    );
    await user.click(screen.getByRole("button", { name: "Clear" }));
    expect(onChange).toHaveBeenCalledWith({ gte: undefined, lte: undefined });
  });

  it("should handle clicking the popover trigger", async () => {
    const user = userEvent.setup();
    render(
      <FilterableDateRange value={{ gte: "01/01/2025", lte: "03/31/2025" }} onChange={onChange} />,
    );
    expect(screen.queryByRole("dialog")).toBeNull();
    await user.click(screen.getByText("Jan 01, 2025 - Mar 30, 2025"));
    expect(screen.getByRole("dialog")).toBeVisible();
  });

  it("should handle clicking the Today button", async () => {
    const user = userEvent.setup();
    render(<FilterableDateRange value={{ gte: undefined, lte: undefined }} onChange={onChange} />);
    await user.click(screen.getByText("Pick a date"));
    await user.click(screen.getByRole("button", { name: "Today" }));
    expect(onChange).toHaveBeenCalledWith({
      gte: offsetToUtc(startOfDay(new Date())).toISOString(),
      lte: offsetToUtc(endOfDay(new Date())).toISOString(),
    });
  });

  it("should handle clicking the Last 7 days button", async () => {
    const user = userEvent.setup();
    render(<FilterableDateRange value={{ gte: undefined, lte: undefined }} onChange={onChange} />);
    await user.click(screen.getByText("Pick a date"));
    await user.click(screen.getByRole("button", { name: "Last 7 Days" }));
    expect(onChange).toHaveBeenCalledWith({
      gte: offsetToUtc(startOfDay(sub(new Date(), { days: 6 }))).toISOString(),
      lte: offsetToUtc(endOfDay(new Date())).toISOString(),
    });
  });

  it("should handle clicking the Month To Date button", async () => {
    const user = userEvent.setup();
    render(<FilterableDateRange value={{ gte: undefined, lte: undefined }} onChange={onChange} />);
    await user.click(screen.getByText("Pick a date"));
    await user.click(screen.getByRole("button", { name: "Month To Date" }));
    expect(onChange).toHaveBeenCalledWith({
      gte: offsetToUtc(startOfDay(startOfMonth(new Date()))).toISOString(),
      lte: offsetToUtc(endOfDay(new Date())).toISOString(),
    });
  });

  it("should handle clicking the Quarter To Date button", async () => {
    const user = userEvent.setup();
    render(<FilterableDateRange value={{ gte: undefined, lte: undefined }} onChange={onChange} />);
    await user.click(screen.getByText("Pick a date"));
    await user.click(screen.getByRole("button", { name: "Month To Date" }));
    expect(onChange).toHaveBeenCalledWith({
      gte: offsetToUtc(startOfDay(startOfQuarter(new Date()))).toISOString(),
      lte: offsetToUtc(endOfDay(new Date())).toISOString(),
    });
  });

  it("should handle clicking the first day of the month", async () => {
    const user = userEvent.setup();
    render(<FilterableDateRange value={{ gte: undefined, lte: undefined }} onChange={onChange} />);
    await user.click(screen.getByText("Pick a date"));
    const pickers = screen.getAllByRole("grid");
    const firstDay = within(pickers[0])
      .getAllByRole("gridcell", { name: "1" })
      .find((day) => !day.getAttribute("disabled"));
    await user.click(firstDay);
    const selectedDate = startOfMonth(new Date());
    expect(onChange).toHaveBeenCalledWith({
      gte: offsetToUtc(startOfDay(selectedDate)).toISOString(),
      lte: offsetToUtc(endOfDay(selectedDate)).toISOString(),
    });
  });

  it("should handle clicking the first day of the month and then today", async () => {
    const user = userEvent.setup();
    const firstDay = startOfMonth(new Date());
    render(
      <FilterableDateRange
        value={{ gte: format(firstDay, "MM/dd/yyyy"), lte: undefined }}
        onChange={onChange}
      />,
    );
    await user.click(screen.getByText(format(firstDay, "LLL dd, yyyy")));
    const pickers = screen.getAllByRole("grid");
    const todayDate = new Date();
    const todayDay = within(pickers[0])
      .getAllByRole("gridcell", { name: `${getDate(todayDate)}` })
      .find((day) => !day.getAttribute("disabled"));

    await user.click(todayDay);

    expect(onChange).toHaveBeenLastCalledWith({
      gte: startOfDay(firstDay).toISOString(),
      lte: offsetToUtc(endOfDay(todayDate)).toISOString(),
    });
  });
});
