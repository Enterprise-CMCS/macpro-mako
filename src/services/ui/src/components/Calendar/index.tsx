import * as React from "react";
import { DayPicker } from "react-day-picker";

import { cn } from "@/lib/utils";
import { buttonVariants } from "../Button";

export type CalendarProps = React.ComponentProps<typeof DayPicker> & {
  className?: string;
  classNames?: any;
  showOutsideDays?: boolean;
};

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: CalendarProps) {
  return (
    <DayPicker
      fromYear={1960}
      toYear={2050}
      showOutsideDays={showOutsideDays}
      className={cn("tw-p-3", className)}
      classNames={{
        months:
          "tw-flex tw-flex-col tw-sm:flex-row tw-space-y-4 tw-sm:space-x-4 tw-sm:space-y-0",
        month: "tw-space-y-4",
        nav: "tw-space-x-1 tw-flex tw-items-center",
        nav_button: cn(
          buttonVariants({ variant: "outline" }),
          "tw-h-7 tw-w-7 tw-bg-transparent tw-p-0 tw-opacity-50 tw-hover:opacity-100"
        ),
        nav_button_previous: "tw-absolute tw-left-1",
        nav_button_next: "tw-absolute tw-right-1",
        table: "tw-w-full tw-border-collapse tw-space-y-1",
        head_row: "tw-flex",
        head_cell:
          "tw-text-muted-foreground tw-rounded-md tw-w-9 tw-font-normal tw-text-[0.8rem]",
        row: "tw-flex tw-w-full tw-mt-2",
        cell: "tw-text-center tw-text-sm tw-p-0 tw-relative tw-[&:has([aria-selected])]:bg-accent tw-first:[&:has([aria-selected])]:rounded-l-md tw-last:[&:has([aria-selected])]:rounded-r-md tw-focus-within:relative tw-focus-within:z-20",
        day: cn(
          buttonVariants({ variant: "ghost" }),
          "tw-h-9 tw-w-9 tw-p-0 tw-font-normal tw-aria-selected:opacity-100"
        ),
        vhidden: "tw-hidden",
        caption_dropdowns: "tw-flex tw-flex-row tw-justify-center",
        caption: "tw-flex tw-flex-col",
        caption_label: "tw-hidden",
        day_selected:
          "tw-bg-primary tw-text-white tw-hover:bg-primary tw-hover:text-primary-foreground tw-focus:bg-primary tw-focus:text-primary-foreground",
        day_today: "tw-bg-gray-200 tw-text-accent-foreground",
        day_outside: "tw-text-muted-foreground tw-opacity-50",
        day_disabled: "tw-text-muted-foreground tw-opacity-50",
        day_range_middle:
          "tw-aria-selected:bg-accent tw-aria-selected:text-accent-foreground",
        day_hidden: "tw-invisible",
        ...classNames,
      }}
      captionLayout="dropdown-buttons"
      components={{
        Dropdown: ({ caption, className, ...props }: any) => {
          return (
            <button className="tw-relative tw-mx-1">
              {caption}
              <select
                className={cn(
                  "tw-absolute tw-left-0 tw-w-auto tw-h-auto tw-opacity-0 tw-cursor-pointer",
                  className
                )}
                {...props}
              />
            </button>
          );
        },
      }}
      {...props}
    />
  );
}
Calendar.displayName = "Calendar";

export { Calendar };
