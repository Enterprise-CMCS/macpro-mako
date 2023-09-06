import * as React from "react";
import * as CheckboxPrimitive from "@radix-ui/react-checkbox";
import { Check } from "lucide-react";

import { cn } from "@/lib/utils";

const Checkbox = React.forwardRef<
  React.ElementRef<typeof CheckboxPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root> & {
    className?: string;
    label: string;
    description?: string;
  }
>(({ className, ...props }, ref) => (
  <div className="tw-items-top tw-flex tw-space-x-2 tw-items-center">
    <CheckboxPrimitive.Root
      ref={ref}
      id={props.label}
      className={cn(
        "tw-peer tw-h-5 tw-w-5 tw-shrink-0 tw-rounded-sm tw-border tw-border-primary tw-ring-offset-background tw-focus-visible:outline-none tw-focus-visible:ring-2 tw-focus-visible:ring-ring tw-focus-visible:ring-offset-2 tw-disabled:cursor-not-allowed tw-disabled:opacity-50 tw-data-[state=checked]:bg-primary tw-data-[state=checked]:text-primary-foreground",
        className
      )}
      {...props}
    >
      <CheckboxPrimitive.Indicator
        className={cn(
          "tw-flex tw-items-center tw-justify-center tw-text-white"
        )}
      >
        <Check className="tw-h-4 tw-w-4" />
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
    <div className="tw-grid tw-gap-1.5 tw-leading-none">
      {!!props.label && (
        <label
          htmlFor={props.label}
          className="tw-text-md tw-font-medium tw-leading-none tw-peer-disabled:cursor-not-allowed tw-peer-disabled:opacity-70"
        >
          {props.label}
        </label>
      )}
      {!!props.description && (
        <p className="tw-text-sm tw-text-muted-foreground">
          {props.description}
        </p>
      )}
    </div>
  </div>
));
Checkbox.displayName = CheckboxPrimitive.Root.displayName;

export const CheckboxGroup: React.FC<{
  value: string[];
  onChange: (value: string[]) => void;
  options: { label: string; value: string }[];
}> = (props) => {
  return (
    <div className="tw-flex tw-flex-col tw-gap-2">
      {props.options.map((OPT) => (
        <Checkbox
          key={`CHECK-${OPT.value}`}
          label={OPT.label}
          checked={props.value.includes(OPT.value)}
          onCheckedChange={(c) => {
            const filtered = props.value.filter((f) => f !== OPT.value);
            if (!c) return props.onChange(filtered);
            props.onChange([...filtered, OPT.value]);
          }}
        />
      ))}
    </div>
  );
};

export { Checkbox };
