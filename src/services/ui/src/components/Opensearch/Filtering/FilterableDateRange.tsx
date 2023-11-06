import { useState, useMemo } from "react";
import { format, isAfter, isBefore, isValid, parse } from "date-fns";
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

function checkValue(str: any, max: any) {
  if (str.charAt(0) !== "0" || str == "00") {
    let num = parseInt(str);
    if (isNaN(num) || num <= 0 || num > max) num = 1;
    str =
      num > parseInt(max.toString().charAt(0)) && num.toString().length == 1
        ? "0" + num
        : num.toString();
  }
  return str;
}

export function FilterableDateRange({ value, onChange, ...props }: Props) {
  const [open, setOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<DateRange | undefined>({
    from: value?.gte ? new Date(value?.gte) : undefined,
    to: value?.lte ? new Date(value?.lte) : undefined,
  });
  const [fromValue, setFromValue] = useState<string>("");
  const [toValue, setToValue] = useState<string>("");

  const handleClose = (updateOpen: boolean) => {
    setOpen(updateOpen);
  };

  const onFromInput = (e: any) => {
    let input = e.target.value;
    if (/\D\/$/.test(input)) input = input.substr(0, input.length - 3);
    const values = input.split("/").map(function (v: string) {
      return v.replace(/\D/g, "");
    });
    if (values[0]) values[0] = checkValue(values[0], 12);
    if (values[1]) values[1] = checkValue(values[1], 31);
    const output = values.map(function (v: string, i: number) {
      return v.length == 2 && i < 2 ? v + " / " : v;
    });

    const newValues = output.join("").substr(0, 14);
    setFromValue(newValues);
  };

  const onToInput = (e: any) => {
    let input = e.target.value;
    if (/\D\/$/.test(input)) input = input.substr(0, input.length - 3);
    const values = input.split("/").map(function (v: any) {
      return v.replace(/\D/g, "");
    });
    if (values[0]) values[0] = checkValue(values[0], 12);
    if (values[1]) values[1] = checkValue(values[1], 31);
    const output = values.map((v: any, i: any) => {
      return v.length == 2 && i < 2 ? v + " / " : v;
    });

    const newValues = output.join("").substr(0, 14);
    setToValue(newValues);
  };

  const onToBlur = () => {
    setToValue((s) => {
      const newDate = s.replaceAll(" ", "");
      const date = parse(newDate, "MM/dd/yyyy", new Date());
      if (!isValid(date)) {
        setSelectedDate({ from: selectedDate?.from, to: undefined });
        return newDate;
      }

      if (selectedDate?.from && isBefore(date, selectedDate.from)) {
        setSelectedDate({ from: date, to: selectedDate.from });
      } else {
        setSelectedDate({ from: selectedDate?.from, to: date });
      }

      return newDate;
    });
  };

  const onFromBlur = () => {
    setFromValue((s) => {
      const newDate = s.replaceAll(" ", "");

      const date = parse(newDate, "MM/dd/yyyy", new Date());
      if (!isValid(date)) {
        setSelectedDate({ from: undefined, to: undefined });
        return newDate;
      }
      if (selectedDate?.to && isAfter(date, selectedDate.to)) {
        setSelectedDate({ from: selectedDate.to, to: date });
      } else {
        setSelectedDate({ from: date, to: selectedDate?.to });
      }

      return newDate;
    });
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
              setSelectedDate(d);
              if (!!d?.from && !!d.to) {
                onChange({
                  gte: d.from.toISOString(),
                  lte: d.to.toISOString(),
                });
              }
            }}
            {...props}
          />
          <div className="flex flex-row gap-4 w-[320px] p-2 m-auto">
            <Input
              onChange={onFromInput}
              value={fromValue}
              onBlur={onFromBlur}
              placeholder="mm/dd/yyyy"
              className="text-md"
            />
            <p>-</p>
            <Input
              onChange={onToInput}
              value={toValue}
              onBlur={onToBlur}
              placeholder="mm/dd/yyyy"
              className="text-md"
            />
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
