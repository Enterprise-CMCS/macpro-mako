"use client";

import * as React from "react";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { DateRange } from "react-day-picker";

import { cn } from "@/lib/utils";
import { Button } from "@/components/Button";
import { Calendar } from "@/components/Calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/Popover";

export function FilterableDateRange({
  value,
  onChange,
  ...props
}: Omit<
  React.HTMLAttributes<HTMLDivElement>,
  "onChange" | "value" | "onSelect"
> & {
  value: DateRange;
  onChange: (val: DateRange) => void;
  className?: string;
}) {
  const [date, setDate] = React.useState<DateRange | undefined>({
    from: value?.from,
    to: value?.to,
  });
  const [open, setOpen] = React.useState(false);

  const handleClose = (updateOpen: boolean) => {
    setOpen(updateOpen);
  };

  React.useEffect(() => {
    if (date?.from && date.to) onChange(date);
  }, [date]);

  return (
    <div className="flex items-center">
      <Popover open={open} onOpenChange={handleClose}>
        <PopoverTrigger>
          <div
            id="date"
            // variant={"outline"}
            className={cn(
              "flex items-center w-[270px] border-[1px] border-black p-2 justify-start text-left font-normal",
              !value && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {(() => {
              const dateFormat = "LLL dd, y";

              if (!!value.from && !!value.to) {
                const from = format(value.from, dateFormat);
                const to = format(value.to, dateFormat);
                return `${from} - ${to}`;
              }
              if (value.from) return `${format(value.from, dateFormat)}`;
              return <span>Pick a date</span>;
            })()}
          </div>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            initialFocus
            mode="range"
            defaultMonth={date?.from}
            selected={date}
            numberOfMonths={2}
            className="bg-white"
            onSelect={setDate}
            {...props}
          />
        </PopoverContent>
      </Popover>
      <Button
        className="text-white"
        onClick={() => {
          setDate({ from: undefined, to: undefined });
          onChange({ from: undefined, to: undefined });
        }}
      >
        Clear
      </Button>
    </div>
  );
}
