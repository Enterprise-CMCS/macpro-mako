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
import { Calendar as CalendarIcon } from "lucide-react";

import { cn } from "@/utils";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
  Button,
  Calendar,
  Input,
} from "@/components";
import { opensearch } from "shared-types";
import {
  getNextBusinessDayTimestamp,
  offsetFromUtc,
  offsetToUtc,
} from "shared-utils";

type Props = Omit<
  React.HTMLAttributes<HTMLDivElement>,
  "onChange" | "value" | "onSelect"
> & {
  value: opensearch.RangeValue;
  onChange: (val: opensearch.RangeValue) => void;
  className?: string;
};

export function FilterableDateRange({ value, onChange, ...props }: Props) {
  const [open, setOpen] = useState(false);
  const selectedDate = useMemo(() => {
    return {
      from: value?.gte ? offsetFromUtc(new Date(value?.gte)) : undefined,
      to: value?.lte ? offsetToUtc(new Date(value?.lte)) : undefined,
    };
  }, [value.gte, value.lte]);
  const fromValue = useMemo(() => {
    return value?.gte
      ? format(offsetFromUtc(new Date(value?.gte)), "MM/dd/yyyy")
      : "";
  }, [value.gte]);
  const toValue = useMemo(() => {
    return value?.lte
      ? format(offsetToUtc(new Date(value?.lte)), "MM/dd/yyyy")
      : "";
  }, [value.lte]);

  const handleClose = (updateOpen: boolean) => {
    setOpen(updateOpen);
  };

  const offsetRangeToUtc = (val: opensearch.RangeValue) => ({
    gte: val.gte ? offsetFromUtc(new Date(val.gte)).toISOString() : undefined,
    lte: val.lte ? offsetToUtc(new Date(val.lte)).toISOString() : undefined,
  });

  const onFromInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const minValidYear = 1960;
    const input = e.target.value;

    if (/^[0-9/]*$/.test(input)) {
      const fromDate = parse(e.target.value, "MM/dd/yyyy", new Date());
      const toDate = value?.lte ? offsetToUtc(new Date(value?.lte)) : "";

      const date: { gte: undefined | string; lte: undefined | string } = {
        gte: fromDate.toISOString(),
        lte: value?.lte,
      };

      if (
        !isValid(fromDate) ||
        getYear(fromDate) < minValidYear ||
        isAfter(fromDate, new Date())
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
      const fromDate = value?.gte ? offsetFromUtc(new Date(value?.gte)) : "";
      const toDate = parse(inputValue, "MM/dd/yyyy", new Date());

      const date: { gte: undefined | string; lte: undefined | string } = {
        gte: value?.gte,
        lte: toDate.toISOString(),
      };

      if (
        !isValid(toDate) ||
        getYear(toDate) < minValidYear ||
        isAfter(toDate, new Date())
      ) {
        date.lte = undefined;
      }
      if (fromDate && isBefore(toDate, fromDate)) date.gte = undefined;

      onChange(offsetRangeToUtc({ ...date }));
    }
  };

  const getDateRange = (
    startDate: Date,
    endDate: Date,
  ): opensearch.RangeValue => {
    return {
      gte: startDate.toISOString(),
      lte: endDate.toISOString(),
    };
  };

  const setPresetRange = (range: string) => {
    const today = startOfDay(new Date());
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

  const label = useMemo(() => {
    const from = value?.gte
      ? format(offsetFromUtc(new Date(value?.gte)), "LLL dd, y")
      : "";
    const to = value?.lte
      ? format(offsetToUtc(new Date(value?.lte)), "LLL dd, y")
      : "";

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
          className="w-auto p-0"
          align="start"
          side="left"
          sideOffset={1}
        >
          <Calendar
            disabled={[
              { after: offsetFromUtc(new Date(getNextBusinessDayTimestamp())) },
            ]}
            initialFocus
            mode="range"
            defaultMonth={selectedDate?.from}
            selected={selectedDate}
            numberOfMonths={2}
            className="bg-white"
            onSelect={(d) => {
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
                // both of these need to use 'offsetToUtc' in order to work
                onChange({
                  gte: offsetToUtc(new Date(d.from)).toISOString(),
                  lte: offsetToUtc(new Date(endOfDay(d.from))).toISOString(),
                });
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
        onClick={() =>
          onChange(offsetRangeToUtc({ gte: undefined, lte: undefined }))
        }
      >
        Clear
      </Button>
    </div>
  );
}
