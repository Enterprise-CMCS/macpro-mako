import { useState, useMemo, useEffect } from "react";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { DateRange } from "react-day-picker";

import { cn } from "@/lib/utils";
import { Button, Calendar } from "@/components/Inputs";
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

  const label = useMemo(() => {
    const from = date?.from ? format(date.from, "LLL dd, y") : "";
    const to = date?.to ? format(date.to, "LLL dd, y") : "";

    if (from && to) return `${from} - ${to}`;
    if (from) return `${from}`;
    return "Pick a date";
  }, [date]);

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
            defaultMonth={date?.from}
            selected={date}
            numberOfMonths={2}
            className="bg-white"
            onSelect={(d) => {
              setDate(d);
              if (!!d?.from && !!d.to) {
                onChange({
                  gte: d.from.toISOString(),
                  lte: d.to.toISOString(),
                });
              }
            }}
            {...props}
          />
        </PopoverContent>
      </Popover>
      <Button
        className="text-white"
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
