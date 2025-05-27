import { CaretSortIcon, CheckIcon } from "@radix-ui/react-icons";
import * as ScrollAreaPrimitive from "@radix-ui/react-scroll-area";
import * as SelectPrimitive from "@radix-ui/react-select";
import * as React from "react";

import { cn } from "@/utils";

const Select = SelectPrimitive.Root;
const SelectGroup = SelectPrimitive.Group;
const SelectValue = SelectPrimitive.Value;

const SelectTrigger = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Trigger> & { className?: string },
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Trigger> & {
    className?: string;
    showIcon?: boolean;
  }
>(({ className, children, showIcon = true, ...props }, ref) => (
  <SelectPrimitive.Trigger
    ref={ref}
    className={cn(
      "flex w-full items-center justify-between rounded-sm border border-gray-300 bg-transparent px-3 py-2 text-sm shadow-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
      className,
    )}
    aria-label="Select option"
    {...props}
  >
    {children}
    {showIcon && (
      <SelectPrimitive.Icon asChild>
        <CaretSortIcon className="h-4 w-4 opacity-50" />
      </SelectPrimitive.Icon>
    )}
  </SelectPrimitive.Trigger>
));
SelectTrigger.displayName = SelectPrimitive.Trigger.displayName;

interface SelectContentProps
  extends React.ComponentPropsWithoutRef<typeof SelectPrimitive.Content> {
  className?: string;
  position?: "item-aligned" | "popper";
  isScrollable?: boolean;
}

const SelectContent = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Content>,
  SelectContentProps
>(({ className, children, position = "popper", isScrollable = false, ...props }, ref) => {
  return (
    <SelectPrimitive.Portal>
      <SelectPrimitive.Content
        ref={ref}
        className={cn(
          "relative z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-md data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
          position === "popper" &&
            "data-[side=bottom]:translate-y-1 data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1 data-[side=top]:-translate-y-1",
          className,
        )}
        position={position}
        {...props}
      >
        {isScrollable ? (
          <ScrollAreaPrimitive.Root
            className={cn(
              "p-1",
              position === "popper" && "h-[225px] min-w-[var(--radix-select-trigger-width)]",
            )}
            type="always"
          >
            <SelectPrimitive.Viewport asChild>
              <ScrollAreaPrimitive.Viewport className="w-full h-full p-2">
                {children}
              </ScrollAreaPrimitive.Viewport>
            </SelectPrimitive.Viewport>
            <ScrollAreaPrimitive.Scrollbar
              className="flex touch-none select-none p-1 data-[orientation=horizontal]:h-2.5 data-[orientation=vertical]:w-4 data-[orientation=horizontal]:flex-col"
              orientation="vertical"
            >
              <ScrollAreaPrimitive.Thumb className="relative bg-gray-400 flex-1 rounded-[10px] before:absolute before:left-1/2 before:top-1/2 before:size-full before:min-h-11 before:min-w-11 before:-translate-x-1/2 before:-translate-y-1/2" />
            </ScrollAreaPrimitive.Scrollbar>
            <ScrollAreaPrimitive.Corner />
          </ScrollAreaPrimitive.Root>
        ) : (
          <SelectPrimitive.Viewport
            className={cn(
              "p-1",
              position === "popper" &&
                "h-[var(--radix-select-trigger-height)] w-full min-w-[var(--radix-select-trigger-width)]",
            )}
          >
            {children}
          </SelectPrimitive.Viewport>
        )}
      </SelectPrimitive.Content>
    </SelectPrimitive.Portal>
  );
});

SelectContent.displayName = SelectPrimitive.Content.displayName;

const SelectLabel = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Label> & { className?: string },
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Label> & {
    className?: string;
  }
>(({ className, ...props }, ref) => (
  <SelectPrimitive.Label
    ref={ref}
    className={cn("px-2 py-1.5 text-sm font-semibold", className)}
    {...props}
  />
));
SelectLabel.displayName = SelectPrimitive.Label.displayName;

const SelectItem = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Item> & { className?: string },
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Item> & {
    className?: string;
  }
>(({ className, children, ...props }, ref) => (
  <SelectPrimitive.Item
    ref={ref}
    className={cn(
      "relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-2 pr-8 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
      className,
    )}
    {...props}
  >
    <span className="absolute right-2 flex h-3.5 w-3.5 items-center justify-center">
      <SelectPrimitive.ItemIndicator>
        <CheckIcon className="h-4 w-4" />
      </SelectPrimitive.ItemIndicator>
    </span>
    <SelectPrimitive.ItemText>
      <span className="text-start flex">{children}</span>
    </SelectPrimitive.ItemText>
  </SelectPrimitive.Item>
));
SelectItem.displayName = SelectPrimitive.Item.displayName;

const SelectSeparator = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Separator> & { className?: string },
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Separator> & {
    className?: string;
  }
>(({ className, ...props }, ref) => (
  <SelectPrimitive.Separator
    ref={ref}
    className={cn("-mx-1 my-1 h-px bg-muted", className)}
    {...props}
  />
));
SelectSeparator.displayName = SelectPrimitive.Separator.displayName;

export {
  Select,
  SelectGroup,
  SelectValue,
  SelectTrigger,
  SelectContent,
  SelectLabel,
  SelectItem,
  SelectSeparator,
};
