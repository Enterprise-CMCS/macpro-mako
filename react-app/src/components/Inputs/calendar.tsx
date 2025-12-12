import * as React from "react";
import { Button as DayButton, DayPicker, type DayProps, useDayRender } from "react-day-picker";
import { CalendarProps } from "shared-types";

import { cn } from "@/utils";

import { buttonVariants } from "./button";

const AccessibleDay = (props: DayProps) => {
  const buttonRef = React.useRef<HTMLButtonElement>(null);
  const dayRender = useDayRender(props.date, props.displayMonth, buttonRef);
  const ariaCurrent = dayRender.activeModifiers.today ? "date" : undefined;

  if (dayRender.isHidden) {
    return <div role="gridcell" />;
  }

  if (!dayRender.isButton) {
    const { className, style, children, ...divProps } = dayRender.divProps;
    return (
      <div
        className={className}
        style={style as React.CSSProperties}
        aria-current={ariaCurrent}
        {...divProps}
      >
        {children}
      </div>
    );
  }

  return <DayButton ref={buttonRef} aria-current={ariaCurrent} {...dayRender.buttonProps} />;
};

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  components,
  ...props
}: CalendarProps) {
  return (
    <DayPicker
      fromYear={1960}
      toYear={2050}
      showOutsideDays={showOutsideDays}
      className={cn("p-3", className)}
      classNames={{
        months: "hidden sm:flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
        month: "space-y-4",
        nav: "space-x-1 flex items-center",
        nav_button: cn(
          buttonVariants({ variant: "outline" }),
          "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100",
        ),
        nav_button_previous: "absolute left-1",
        nav_button_next: "absolute right-1",
        table: "w-full border-collapse space-y-1",
        head_row: "flex",
        head_cell: "text-muted-foreground rounded-md w-9 font-normal text-[0.8rem]",
        row: "flex w-full mt-2",
        cell: "text-center text-sm p-0 relative [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
        day: cn(
          buttonVariants({ variant: "ghost" }),
          "h-9 w-9 p-0 font-normal aria-selected:opacity-100",
        ),
        vhidden: "hidden",
        caption_dropdowns: "flex flex-row justify-center",
        caption: "flex flex-col",
        caption_label: "hidden",
        day_selected:
          "bg-primary text-white hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
        day_today: "bg-gray-200 text-accent-foreground",
        day_outside: "text-muted-foreground opacity-50",
        day_disabled: "text-muted-foreground opacity-50",
        day_range_middle: "aria-selected:bg-accent aria-selected:text-accent-foreground",
        day_hidden: "invisible",
        ...classNames,
      }}
      captionLayout="dropdown-buttons"
      components={{
        Day: AccessibleDay,
        Dropdown: ({ caption, className, ...dropdownProps }: any) => {
          return (
            <button className="relative mx-1">
              {caption}
              <select
                className={cn("absolute left-0 w-auto h-auto opacity-0 cursor-pointer", className)}
                {...dropdownProps}
              />
            </button>
          );
        },
        ...(components ?? {}),
      }}
      {...props}
    />
  );
}
Calendar.displayName = "Calendar";

export { Calendar };
