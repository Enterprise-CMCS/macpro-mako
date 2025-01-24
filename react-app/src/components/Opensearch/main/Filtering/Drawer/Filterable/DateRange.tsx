import { useState, useMemo } from "react";
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
  startOfDay,
} from "date-fns";
import { UTCDate } from "@date-fns/utc";
import { Calendar as CalendarIcon } from "lucide-react";

import { cn } from "@/utils";
import { Popover, PopoverContent, PopoverTrigger, Button, Calendar, Input } from "@/components";
import { opensearch } from "shared-types";
import { getNextBusinessDayTimestamp } from "shared-utils";

type Props = Omit<React.HTMLAttributes<HTMLDivElement>, "onChange" | "value" | "onSelect"> & {
  value: opensearch.RangeValue;
  onChange: (val: opensearch.RangeValue) => void;
  className?: string;
};

export const DATE_FORMAT = "MM/dd/yyyy";
export const DATE_DISPLAY_FORMAT = "LLL dd, y";

export function FilterableDateRange({ value, onChange, ...props }: Props) {
  const [open, setOpen] = useState(false);
  const selectedDate = useMemo(() => {
    return {
      from: value?.gte ? new UTCDate(value?.gte) : undefined,
      to: value?.lte ? new UTCDate(value?.lte) : undefined,
    };
  }, [value.gte, value.lte]);
  const fromValue = useMemo(() => {
    return value?.gte ? format(new UTCDate(value?.gte), DATE_FORMAT) : "";
  }, [value.gte]);
  const toValue = useMemo(() => {
    return value?.lte ? format(new UTCDate(value?.lte), DATE_FORMAT) : "";
  }, [value.lte]);

  const handleClose = (updateOpen: boolean) => {
    setOpen(updateOpen);
  };

  const offsetRangeToUtc = (val: opensearch.RangeValue) => ({
    gte: val.gte ? new UTCDate(val.gte).toISOString() : undefined,
    lte: val.lte ? new UTCDate(val.lte).toISOString() : undefined,
  });

  const onFromInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const minValidYear = 1960;
    const input = e.target.value;

    if (/^[0-9/]*$/.test(input)) {
      const fromDate = parse(e.target.value, DATE_FORMAT, new UTCDate());
      const toDate = value?.lte ? new UTCDate(value?.lte) : "";

      const date: { gte: undefined | string; lte: undefined | string } = {
        gte: fromDate.toISOString(),
        lte: value?.lte,
      };

      if (
        !isValid(fromDate) ||
        getYear(fromDate) < minValidYear ||
        isAfter(fromDate, new UTCDate())
      ) {
        date.gte = undefined;
      }
      if (toDate && isAfter(fromDate, toDate)) {
        date.lte = undefined;
      }
      onChange(offsetRangeToUtc({ ...date }));
    }
  };

  const onToInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const minValidYear = 1960;
    const inputValue = e.target.value;

    if (/^[0-9/]*$/.test(inputValue)) {
      const fromDate = value?.gte ? new UTCDate(value?.gte) : "";
      const toDate = parse(inputValue, DATE_FORMAT, new UTCDate());

      const date: { gte: undefined | string; lte: undefined | string } = {
        gte: value?.gte,
        lte: toDate.toISOString(),
      };

      if (!isValid(toDate) || getYear(toDate) < minValidYear || isAfter(toDate, new UTCDate())) {
        date.lte = undefined;
      }
      if (fromDate && isBefore(toDate, fromDate)) date.gte = undefined;

      onChange(offsetRangeToUtc({ ...date }));
    }
  };

  const getDateRange = (startDate: Date, endDate: Date): opensearch.RangeValue => {
    return {
      gte: startDate.toISOString(),
      lte: endDate.toISOString(),
    };
  };

  const setPresetRange = (range: string) => {
    const today = startOfDay(new UTCDate());
    let startDate = today;
    if (range === "quarter") {
      startDate = startOfQuarter(today);
    } else if (range === "month") {
      startDate = startOfMonth(today);
    } else if (range === "week") {
      startDate = sub(today, { days: 6 });
    }

    const rangeObject = getDateRange(startDate, endOfDay(today));
    onChange(offsetRangeToUtc(rangeObject));
  };

  // Calendar props
  const disableDates = [{ after: new UTCDate(getNextBusinessDayTimestamp()) }];

  const onSelect = (d: any) => {
    if (!!d?.from && !!d.to) {
      onChange(
        offsetRangeToUtc({
          gte: d.from.toISOString(),
          lte: endOfDay(d.to).toISOString(),
        }),
      );
    } else if (!d?.from && !d?.to) {
      onChange(
        offsetRangeToUtc({
          gte: "",
          lte: "",
        }),
      );
    } else if (d?.from && !d?.to) {
      onChange(offsetRangeToUtc(getDateRange(d.from, endOfDay(d.from))));
    }
  };

  const label = useMemo(() => {
    const from = value?.gte ? format(new UTCDate(value?.gte), DATE_DISPLAY_FORMAT) : "";
    const to = value?.lte ? format(new UTCDate(value?.lte), DATE_DISPLAY_FORMAT) : "";

    if (from && to) return `${from} - ${to}`;
    if (from) return `${from}`;
    return "Pick a date";
  }, [value.gte, value.lte]);

  return (
    <div className="flex items-center">
      <Popover open={open} onOpenChange={handleClose}>
        <PopoverTrigger>
          <div
            id="date"
            className={cn(
              "flex items-center w-[270px] border-[1px] border-black p-2 justify-start text-left font-normal",
              !value && "text-muted-foreground",
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {label}
          </div>
        </PopoverTrigger>
        <PopoverContent
          className="min-w-fit lg:w-auto p-0"
          align="start"
          side="left"
          sideOffset={1}
        >
          <Calendar
            disabled={disableDates}
            initialFocus
            mode="range"
            defaultMonth={selectedDate?.from}
            selected={selectedDate}
            numberOfMonths={2}
            className="bg-white"
            onSelect={onSelect}
            {...props}
          />
          <div className="lg:hidden flex align-center">
            <Calendar
              disabled={disableDates}
              initialFocus
              mode="range"
              defaultMonth={selectedDate?.from}
              selected={selectedDate}
              numberOfMonths={1}
              className="bg-white"
              onSelect={onSelect}
              {...props}
            />
          </div>
          <div className="flex flex-row gap-2 lg:gap-4 w-min-[300px] lg:w-[320px] p-2 m-auto">
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
          <div className="flex w-full flex-wrap lg:flex-row p-1">
            <div className="w-1/2 lg:w-1/4 p-1">
              <Button className="w-full" onClick={() => setPresetRange("today")}>
                Today
              </Button>
            </div>
            <div className="w-1/2 lg:w-1/4 p-1">
              <Button className="w-full" onClick={() => setPresetRange("week")}>
                Last 7 Days
              </Button>
            </div>
            <div className="w-1/2 lg:w-1/4 p-1">
              <Button className="w-full" onClick={() => setPresetRange("month")}>
                Month To Date
              </Button>
            </div>
            <div className="w-1/2 lg:w-1/4 p-1">
              <Button className="w-full" onClick={() => setPresetRange("quarter")}>
                Quarter To Date
              </Button>
            </div>
          </div>
        </PopoverContent>
      </Popover>
      <Button
        className="text-white"
        onClick={() => onChange(offsetRangeToUtc({ gte: undefined, lte: undefined }))}
      >
        Clear
      </Button>
    </div>
  );
}
