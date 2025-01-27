import { useState, useMemo } from "react";
import { format, startOfQuarter, startOfMonth, sub, endOfDay, startOfDay } from "date-fns";
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
  const fromValue = useMemo(() => {
    return value?.gte ? format(new UTCDate(value?.gte), DATE_FORMAT) : "";
  }, [value.gte]);
  const toValue = useMemo(() => {
    return value?.lte ? format(new UTCDate(value?.lte), DATE_FORMAT) : "";
  }, [value.lte]);
  const selectedDate = useMemo(() => {
    return {
      from: fromValue !== "" ? startOfDay(new Date(fromValue)) : undefined,
      to: toValue !== "" ? endOfDay(new Date(toValue)) : undefined,
    };
  }, [fromValue, toValue]);

  const handleClose = (updateOpen: boolean) => {
    setOpen(updateOpen);
  };

  const getDateRange = (
    startDate: Date | undefined,
    endDate: Date | undefined,
  ): opensearch.RangeValue => {
    const gte = startDate
      ? (startOfDay(new UTCDate(startDate)) as UTCDate).toISOString()
      : undefined;
    const lte = endDate ? (endOfDay(new UTCDate(endDate)) as UTCDate).toISOString() : undefined;

    return {
      gte,
      lte,
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

    onChange(getDateRange(startDate, today));
  };

  // Calendar props
  const disableDates = [{ after: getNextBusinessDayTimestamp() }];

  const onSelect = (d: any) => {
    if (!!d?.from && !!d.to) {
      onChange(getDateRange(d.from, d.to));
    } else if (!d?.from && !d?.to) {
      onChange({ gte: undefined, lte: undefined });
    } else if (d?.from && !d?.to) {
      onChange(getDateRange(d.from, d.from));
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
            <Input value={fromValue} placeholder="mm/dd/yyyy" className="text-md" />
            <p>-</p>
            <Input value={toValue} placeholder="mm/dd/yyyy" className="text-md" />
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
      <Button className="text-white" onClick={() => onChange({ gte: undefined, lte: undefined })}>
        Clear
      </Button>
    </div>
  );
}
