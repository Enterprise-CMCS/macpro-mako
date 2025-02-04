import { describe, expect, it, vi, afterEach } from "vitest";
import { screen, render, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { FilterableDateRange, DATE_FORMAT, DATE_DISPLAY_FORMAT } from "./DateRange";
import { format, startOfQuarter, startOfMonth, sub, endOfDay, startOfDay, setDate } from "date-fns";
import { UTCDate } from "@date-fns/utc";

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
      <FilterableDateRange
        value={{ gte: undefined, lte: format(endOfDay(new UTCDate()), DATE_FORMAT) }}
        onChange={onChange}
      />,
    );
    expect(screen.getByText("Pick a date")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Clear" })).toBeInTheDocument();
  });

  it("should display from date if value is only from date", () => {
    const today = startOfDay(new UTCDate());
    render(
      <FilterableDateRange
        value={{ gte: format(today, DATE_DISPLAY_FORMAT), lte: undefined }}
        onChange={onChange}
      />,
    );
    expect(screen.getByText(format(today, DATE_DISPLAY_FORMAT))).toBeInTheDocument();
  });

  it("should display from and to date if value has both", () => {
    const start = startOfDay(sub(new UTCDate(), { days: 90 }));
    const end = endOfDay(new UTCDate());
    render(
      <FilterableDateRange
        value={{
          gte: format(start, DATE_FORMAT),
          lte: format(end, DATE_FORMAT),
        }}
        onChange={onChange}
      />,
    );
    expect(
      screen.getByText(
        `${format(start, DATE_DISPLAY_FORMAT)} - ${format(end, DATE_DISPLAY_FORMAT)}`,
      ),
    ).toBeInTheDocument();
  });

  it("should handle clicking the Clear button", async () => {
    const user = userEvent.setup();
    const start = startOfDay(sub(new UTCDate(), { days: 90 }));
    const end = endOfDay(new UTCDate());
    render(
      <FilterableDateRange
        value={{ gte: format(start, DATE_FORMAT), lte: format(end, DATE_FORMAT) }}
        onChange={onChange}
      />,
    );
    await user.click(screen.getByRole("button", { name: "Clear" }));
    expect(onChange).toHaveBeenCalledWith({ gte: undefined, lte: undefined });
  });

  it("should handle clicking the popover trigger", async () => {
    const user = userEvent.setup();
    render(<FilterableDateRange value={{ gte: undefined, lte: undefined }} onChange={onChange} />);
    expect(screen.queryByRole("dialog")).toBeNull();
    await user.click(screen.getByText("Pick a date"));
    expect(screen.getByRole("dialog")).toBeVisible();
  });

  it("should handle clicking the Today button", async () => {
    const user = userEvent.setup();
    render(<FilterableDateRange value={{ gte: undefined, lte: undefined }} onChange={onChange} />);
    await user.click(screen.getByText("Pick a date"));
    await user.click(screen.getByRole("button", { name: "Today" }));
    expect(onChange).toHaveBeenCalledWith({
      gte: (startOfDay(new UTCDate()) as UTCDate).toISOString(),
      lte: (endOfDay(new UTCDate()) as UTCDate).toISOString(),
    });
  });

  it("should handle clicking the Last 7 days button", async () => {
    const user = userEvent.setup();
    render(<FilterableDateRange value={{ gte: undefined, lte: undefined }} onChange={onChange} />);
    await user.click(screen.getByText("Pick a date"));
    await user.click(screen.getByRole("button", { name: "Last 7 Days" }));
    expect(onChange).toHaveBeenCalledWith({
      gte: (startOfDay(sub(new UTCDate(), { days: 6 })) as UTCDate).toISOString(),
      lte: (endOfDay(new UTCDate()) as UTCDate).toISOString(),
    });
  });

  it("should handle clicking the Month To Date button", async () => {
    const user = userEvent.setup();
    render(<FilterableDateRange value={{ gte: undefined, lte: undefined }} onChange={onChange} />);
    await user.click(screen.getByText("Pick a date"));
    await user.click(screen.getByRole("button", { name: "Month To Date" }));

    expect(onChange).toHaveBeenCalledWith({
      gte: (startOfDay(startOfMonth(new UTCDate())) as UTCDate).toISOString(),
      lte: (endOfDay(new UTCDate()) as UTCDate).toISOString(),
    });
  });

  it("should handle clicking the Quarter To Date button", async () => {
    const user = userEvent.setup();
    render(<FilterableDateRange value={{ gte: undefined, lte: undefined }} onChange={onChange} />);
    await user.click(screen.getByText("Pick a date"));
    await user.click(screen.getByRole("button", { name: "Quarter To Date" }));
    expect(onChange).toHaveBeenCalledWith({
      gte: (startOfDay(startOfQuarter(new UTCDate())) as UTCDate).toISOString(),
      lte: (endOfDay(new UTCDate()) as UTCDate).toISOString(),
    });
  });

  it("should handle clicking the first day of the month", async () => {
    const user = userEvent.setup();
    render(<FilterableDateRange value={{ gte: undefined, lte: undefined }} onChange={onChange} />);
    await user.click(screen.getByText("Pick a date"));

    const picker = screen.getAllByRole("grid", {
      name: format(new Date(), "MMMM yyyy"),
    })[0];
    // there will be two date pickers for the month but we only
    // want the first one because we want the beginning of the month
    const firstDay = within(picker)
      .getAllByRole("gridcell", { name: "1" })
      .find((day) => !day.getAttribute("disabled"));
    await user.click(firstDay);
    const selectedDate = startOfMonth(new UTCDate());
    expect(onChange).toHaveBeenCalledWith({
      gte: (startOfDay(selectedDate) as UTCDate).toISOString(),
      lte: (endOfDay(selectedDate) as UTCDate).toISOString(),
    });
  });

  it.skip("should handle the first day set to the month and clicking the 15th", async () => {
    // This one is like... annoying.x
    const user = userEvent.setup();
    const today = new UTCDate();
    const firstDay = startOfMonth(today) as UTCDate;
    const fifteenthDay = setDate(today, 15) as UTCDate;

    render(
      <FilterableDateRange
        value={{ gte: format(firstDay, DATE_FORMAT), lte: undefined }}
        onChange={onChange}
      />,
    );
    await user.click(screen.getByText(format(firstDay, DATE_DISPLAY_FORMAT)));

    const picker = screen.getAllByRole("grid", {
      name: format(new Date(), "MMMM yyyy"),
    })[0];
    // there will be two date pickers for the month but we only
    // want the first one because we want the middle of the month
    const fifteenthDayButton = within(picker)
      .getAllByRole("gridcell", { name: "15" })
      .find((day) => !day.getAttribute("disabled"));
    expect(fifteenthDayButton).not.toBeNull();

    if (fifteenthDayButton) {
      await user.click(fifteenthDayButton);

      expect(onChange).toHaveBeenLastCalledWith({
        gte: (startOfDay(firstDay) as UTCDate).toISOString(),
        lte: (endOfDay(fifteenthDay) as UTCDate).toISOString(),
      });
    }
  });

  it("should handle the start date being set to last week and clicking today", async () => {
    const user = userEvent.setup();
    const endDate = new Date();
    const startDate = sub(endDate, { days: 6 });

    render(
      <FilterableDateRange
        value={{ gte: format(startDate, DATE_FORMAT), lte: undefined }}
        onChange={onChange}
      />,
    );
    await user.click(screen.getByText(format(startDate, DATE_DISPLAY_FORMAT)));

    const picker = screen.getAllByRole("grid", {
      name: format(new Date(), "MMMM yyyy"),
    })[0];

    const dateButtons = within(picker)
      .getAllByRole("gridcell", { name: `${endDate.getDate()}` })
      .filter((day) => !day.getAttribute("disabled"));
    let todayButton = null;
    if (dateButtons.length === 1) {
      todayButton = dateButtons[0];
    } else if (dateButtons.length > 1) {
      todayButton = startDate.getMonth() < endDate.getMonth() ? dateButtons[0] : dateButtons[1];
    }

    if (todayButton) {
      await user.click(todayButton);

      expect(onChange).toHaveBeenLastCalledWith({
        gte: (startOfDay(new UTCDate(startDate)) as UTCDate).toISOString(),
        lte: (endOfDay(new UTCDate(endDate)) as UTCDate).toISOString(),
      });
    }
  });

  it("should handle deselecting", async () => {
    const user = userEvent.setup();
    const firstDay = startOfMonth(new UTCDate()) as UTCDate;
    render(
      <FilterableDateRange
        value={{ gte: format(firstDay, DATE_FORMAT), lte: format(firstDay, DATE_FORMAT) }}
        onChange={onChange}
      />,
    );
    await user.click(
      screen.getByText(
        `${format(firstDay, DATE_DISPLAY_FORMAT)} - ${format(firstDay, DATE_DISPLAY_FORMAT)}`,
      ),
    );

    const pickers = screen.getAllByRole("grid");
    const firstDayBtn = within(pickers[0])
      .getAllByRole("gridcell", { name: "1" })
      .find((day) => !day.getAttribute("disabled"));
    await user.click(firstDayBtn);

    expect(onChange).toHaveBeenCalledWith({ gte: undefined, lte: undefined });
  });
});
