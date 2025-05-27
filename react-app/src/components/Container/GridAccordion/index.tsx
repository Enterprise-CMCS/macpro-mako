import * as AccordionPrimitive from "@radix-ui/react-accordion";
import { ChevronDown, Minus, Plus } from "lucide-react";
import * as React from "react";

import { cn } from "@/utils";
const GridAccordion = AccordionPrimitive.Root;
type AccordionItemProps = {
  className?: string; // Add className to prop type definition
} & React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Item>;

const GridAccordionItem = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Item>,
  AccordionItemProps
>(({ className, ...props }, ref) => (
  <AccordionPrimitive.Item ref={ref} className={cn("border-b", className)} {...props} />
));
GridAccordionItem.displayName = "GridAccordionItem";

type GridAccordionTriggerProps = {
  className?: string; // Add className to prop type definition
  showPlusMinus?: boolean;
  col1?: React.ReactNode; // Optional prop for first column
  col2?: React.ReactNode; // Optional prop for second column
  col3?: React.ReactNode; // Optional prop for third column
} & React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Trigger>;

const GridAccordionTrigger = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Trigger>,
  GridAccordionTriggerProps
>(({ className, showPlusMinus, col1, col2, col3, ...props }, ref) => {
  const animationClass = showPlusMinus ? "group" : "[&[data-state=open]>svg]:rotate-180";
  return (
    <AccordionPrimitive.Header>
      <AccordionPrimitive.Trigger
        ref={ref}
        className={cn(
          "w-full two-cols-gutter items-center py-4 font-medium transition-all hover:underline",
          animationClass,
          className,
        )}
        {...props}
      >
        <div className="col-left-gutter text-left">{col1}</div>
        <div className="col-gutter text-left">{col2}</div>
        <div className="col-right-gutter grid grid-cols-[1fr_1rem] gap-x-4 items-center">
          <div className="text-left">{col3}</div>
          {showPlusMinus ? (
            <>
              <Plus className="h-4 w-4 shrink-0 transition-transform duration-200 group-data-[state=open]:hidden" />
              <Minus className="h-4 w-4 shrink-0 transition-transform duration-200 group-data-[state=closed]:hidden" />
            </>
          ) : (
            <ChevronDown className="h-4 w-4 shrink-0 transition-transform duration-200" />
          )}
        </div>
      </AccordionPrimitive.Trigger>
    </AccordionPrimitive.Header>
  );
});
GridAccordionTrigger.displayName = AccordionPrimitive.Trigger.displayName;

type GridAccordionContentProps = {
  className?: string; // Add className to prop type definition
} & React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Content>;

const GridAccordionContent = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Content>,
  GridAccordionContentProps
>(({ className, children, ...props }, ref) => (
  <AccordionPrimitive.Content
    ref={ref}
    className={cn("text-sm transition-all px-3", className)}
    {...props}
  >
    <div className="pb-4 pt-0">{children}</div>
  </AccordionPrimitive.Content>
));
GridAccordionContent.displayName = AccordionPrimitive.Content.displayName;

export { GridAccordion, GridAccordionItem, GridAccordionTrigger, GridAccordionContent };
