import { useState, useMemo, useEffect } from "react";
import {
  format,
  isAfter,
  isBefore,
  isValid,
  parse,
  startOfQuarter,
  startOfMonth,
  sub,
  getYear,
  endOfDay,
} from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { DateRange } from "react-day-picker";

import { cn } from "@/lib/utils";
import { Button, Calendar, Input } from "@/components/Inputs";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/Popover";
import { OsRangeValue } from "shared-types";

type Props = Omit<
  React.HTMLAttributes<HTMLDivElement>,
  "onChange" | "value" | "onSelect"
> & {
  value: OsRangeValue;
  onChange: (val: OsRangeValue) => void;
  className?: string;
};

export function FilterableDateRange({ value, onChange, ...props }: Props) {
  const [open, setOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<DateRange | undefined>({
    from: value?.gte ? new Date(value?.gte) : undefined,
    to: value?.lte ? new Date(value?.lte) : undefined,
  });
  const [fromValue, setFromValue] = useState<string>(
    value?.gte ? format(new Date(value?.gte), "MM/dd/yyyy") : ""
  );
  const [toValue, setToValue] = useState<string>(
    value?.lte ? format(new Date(value?.lte), "MM/dd/yyyy") : ""
  );

  useEffect(() => {
    console.log("useeffect", value);
    setToValue(value?.lte ? format(new Date(value?.lte), "MM/dd/yyyy") : "");
    setFromValue(value?.gte ? format(new Date(value?.gte), "MM/dd/yyyy") : "");
  }, [value]);

  const handleClose = (updateOpen: boolean) => {
    setOpen(updateOpen);
  };

  const checkSingleDateSelection = (
    from: Date | undefined,
    to: Date | undefined
  ) => {
    if (from && !to) {
      const rangeObject = getDateRange(from, endOfDay(from));
      onChange(rangeObject);
      setFromValue(format(from, "MM/dd/yyyy"));
    }
  };

  const onFromInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const minValidYear = 1960;
    const input = e.target.value;

    if (/^[0-9/]*$/.test(input)) {
      setFromValue(e.target.value);
      const date = parse(e.target.value, "MM/dd/yyyy", new Date());
      if (
        !isValid(date) ||
        getYear(date) < minValidYear ||
        isAfter(date, new Date())
      ) {
        return setSelectedDate({ from: undefined, to: selectedDate?.to });
      }
      if (selectedDate?.to && isAfter(date, selectedDate.to)) {
        setSelectedDate({ from: date, to: undefined });
        setToValue("");
      } else {
        setSelectedDate({ from: date, to: selectedDate?.to });
        onChange({
          gte: date.toISOString(),
          lte: selectedDate?.to?.toISOString() || "",
        });
      }
    }
  };

  const onToInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const minValidYear = 1960;
    const input = e.target.value;

    if (/^[0-9/]*$/.test(input)) {
      setToValue(e.target.value);
      const date = parse(e.target.value, "MM/dd/yyyy", new Date());

      if (
        !isValid(date) ||
        getYear(date) > minValidYear ||
        !isAfter(date, new Date())
      ) {
        return setSelectedDate({ from: selectedDate?.from, to: undefined });
      }

      if (selectedDate?.from && isBefore(date, selectedDate.from)) {
        setSelectedDate({ from: undefined, to: selectedDate.from });
        setFromValue("");
      } else {
        setSelectedDate({ from: selectedDate?.from, to: date });
        onChange({
          gte: selectedDate?.from?.toISOString() || "",
          lte: date.toISOString(),
        });
      }
    }
  };

  const getDateRange = (startDate: Date, endDate: Date): OsRangeValue => {
    return {
      gte: startDate.toISOString(),
      lte: endDate.toISOString(),
    };
  };

  const setPresetRange = (range: string) => {
    const today = new Date();
    let startDate = today;

    if (range === "quarter") {
      startDate = startOfQuarter(today);
    } else if (range === "month") {
      startDate = startOfMonth(today);
    } else if (range === "week") {
      startDate = sub(today, { days: 6 });
    }

    const rangeObject = getDateRange(startDate, today);

    onChange(rangeObject);
    setSelectedDate({ from: startDate, to: today });
    setFromValue(format(startDate, "MM/dd/yyyy"));
    setToValue(format(today, "MM/dd/yyyy"));
  };

  const label = useMemo(() => {
    const from = selectedDate?.from
      ? format(selectedDate.from, "LLL dd, y")
      : "";
    const to = selectedDate?.to ? format(selectedDate.to, "LLL dd, y") : "";

    if (from && to) return `${from} - ${to}`;
    if (from) return `${from}`;
    return "Pick a date";
  }, [selectedDate]);

  return (
    <div className="flex items-center">
      <Popover open={open} onOpenChange={handleClose}>
        <PopoverTrigger>
          <div
            id="date"
            className={cn(
              "flex items-center w-[270px] border-[1px] border-black p-2 justify-start text-left font-normal",
              !value && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {label}
          </div>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            disabled={[{ after: new Date() }]}
            initialFocus
            mode="range"
            defaultMonth={selectedDate?.from}
            selected={selectedDate}
            numberOfMonths={2}
            className="bg-white"
            onSelect={(d) => {
              console.log("onSelect");
              setSelectedDate(d);
              if (!!d?.from && !!d.to) {
                onChange({
                  gte: d.from.toISOString(),
                  lte: d.to.toISOString(),
                });
                setFromValue(format(d.from, "MM/dd/yyyy"));
                setToValue(format(d.to, "MM/dd/yyyy"));
              } else if (!d?.from && !d?.to) {
                onChange({
                  gte: "",
                  lte: "",
                });
                setFromValue("");
                setToValue("");
              } else {
                checkSingleDateSelection(d.from, d.to);
              }
            }}
            {...props}
          />
          <div className="flex flex-row gap-4 w-[320px] p-2 m-auto">
            <Input
              onChange={onFromInput}
              value={fromValue}
              placeholder="mm/dd/yyyy"
              className="text-md"
            />
            <p>-</p>
            <Input
              onChange={onToInput}
              value={toValue}
              placeholder="mm/dd/yyyy"
              className="text-md"
            />
          </div>
          <div className="flex gap-4 p-2 ml-4">
            <Button onClick={() => setPresetRange("today")}>Today</Button>
            <Button onClick={() => setPresetRange("week")}>Last 7 Days</Button>
            <Button onClick={() => setPresetRange("month")}>
              Month To Date
            </Button>
            <Button onClick={() => setPresetRange("quarter")}>
              Quarter To Date
            </Button>
          </div>
        </PopoverContent>
      </Popover>
      <Button
        className="text-white"
        onClick={() => {
          setSelectedDate({ from: undefined, to: undefined });
          onChange({ gte: undefined, lte: undefined });
        }}
      >
        Clear
      </Button>
    </div>
  );
}
