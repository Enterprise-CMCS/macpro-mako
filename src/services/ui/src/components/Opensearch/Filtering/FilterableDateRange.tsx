import { useState, useMemo, useEffect } from "react";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { DateRange } from "react-day-picker";

import { cn } from "@/lib/utils";
import { Button } from "@/components/Button";
import { Calendar } from "@/components/Calendar";
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
  const [date, setDate] = useState<DateRange | undefined>({
    from: value?.gte ? new Date(value?.gte) : undefined,
    to: value?.lte ? new Date(value?.lte) : undefined,
  });

  const handleClose = (updateOpen: boolean) => {
    setOpen(updateOpen);
  };

  useEffect(() => {
    if (!!date?.from && !!date.to) {
      onChange({ gte: date.from.toISOString(), lte: date.to.toISOString() });
    }
  }, [date]);

  const label = useMemo(() => {
    const from = date?.from ? format(date.from, "LLL dd, y") : "";
    const to = date?.to ? format(date.to, "LLL dd, y") : "";

    if (from && to) return `${from} - ${to}`;
    if (from) return `${from}`;
    return "Pick a date";
  }, [date]);

  return (
    <div className="tw-flex tw-items-center">
      <Popover open={open} onOpenChange={handleClose}>
        <PopoverTrigger>
          <div
            id="date"
            className={cn(
              "tw-flex tw-items-center tw-w-[270px] tw-border-[1px] tw-border-black tw-p-2 tw-justify-start tw-text-left tw-font-normal",
              !value && "tw-text-muted-foreground"
            )}
          >
            <CalendarIcon className="tw-mr-2 tw-h-4 tw-w-4" />
            {label}
          </div>
        </PopoverTrigger>
        <PopoverContent className="tw-w-auto tw-p-0" align="start">
          <Calendar
            initialFocus
            mode="range"
            defaultMonth={date?.from}
            selected={date}
            numberOfMonths={2}
            className="tw-bg-white"
            onSelect={setDate}
            {...props}
          />
        </PopoverContent>
      </Popover>
      <Button
        className="tw-text-white"
        onClick={() => {
          setDate({ from: undefined, to: undefined });
          onChange({ gte: undefined, lte: undefined });
        }}
      >
        Clear
      </Button>
    </div>
  );
}
