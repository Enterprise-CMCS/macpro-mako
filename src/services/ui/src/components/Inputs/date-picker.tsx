"use client";

import * as React from "react";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/Inputs/button";
import { Calendar } from "@/components/Inputs/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/Popover";

type DatePickerProps = {
  date: Date | undefined;
  onChange: (date: Date | undefined) => void;
};

export const DatePicker = ({ date, onChange }: DatePickerProps) => {
  const [isCalendarOpen, setIsCalendarOpen] = React.useState<boolean>(false);

  return (
    <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
      <PopoverTrigger asChild>
        <Button
          variant={"outline"}
          className={cn(
            "w-[280px] justify-start text-left font-normal",
            !date && "text-muted-foreground"
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {date ? format(date, "PPP") : <span>Pick a date</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0">
        <Calendar
          mode="single"
          selected={date}
          onSelect={(date) => {
            onChange(date);
            setIsCalendarOpen(false);
          }}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  );
};
