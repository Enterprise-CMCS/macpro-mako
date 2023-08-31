import * as React from "react";
import * as AccordionPrimitive from "@radix-ui/react-accordion";
import { ChevronDown } from "lucide-react";

import { cn } from "@/lib/utils";

const Accordion = AccordionPrimitive.Root;

type AccordionItemProps = {
  className?: string; // Add className to prop type definition
} & React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Item>;

const AccordionItem = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Item>,
  AccordionItemProps
>(({ className, ...props }, ref) => (
  <AccordionPrimitive.Item
    ref={ref}
    className={cn("tw-border-b", className)}
    {...props}
  />
));
AccordionItem.displayName = "AccordionItem";

type AccordionTriggerProps = {
  className?: string; // Add className to prop type definition
} & React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Trigger>;

const AccordionTrigger = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Trigger>,
  AccordionTriggerProps
>(({ className, children, ...props }, ref) => (
  <AccordionPrimitive.Header className="tw-flex">
    <AccordionPrimitive.Trigger
      ref={ref}
      className={cn(
        "tw-flex tw-flex-1 tw-items-center tw-justify-between tw-py-4 tw-font-medium tw-transition-all hover:tw-underline [&[data-state=open]>svg]:tw-rotate-180",
        className
      )}
      {...props}
    >
      {children}
      <ChevronDown className="tw-h-4 tw-w-4 tw-shrink-0 tw-transition-transform tw-duration-200" />
    </AccordionPrimitive.Trigger>
  </AccordionPrimitive.Header>
));
AccordionTrigger.displayName = AccordionPrimitive.Trigger.displayName;

type AccordionContentProps = {
  className?: string; // Add className to prop type definition
} & React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Content>;

const AccordionContent = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Content>,
  AccordionContentProps
>(({ className, children, ...props }, ref) => (
  <AccordionPrimitive.Content
    ref={ref}
    className={cn(
      "tw-overflow-hidden tw-text-sm tw-transition-all data-[state=closed]:tw-animate-accordion-up data-[state=open]:tw-animate-accordion-down",
      className
    )}
    {...props}
  >
    <div className="tw-pb-4 tw-pt-0">{children}</div>
  </AccordionPrimitive.Content>
));
AccordionContent.displayName = AccordionPrimitive.Content.displayName;

export { Accordion, AccordionItem, AccordionTrigger, AccordionContent };
