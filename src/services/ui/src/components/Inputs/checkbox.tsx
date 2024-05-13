import * as React from "react";
import * as CheckboxPrimitive from "@radix-ui/react-checkbox";
import { Check } from "lucide-react";
import { cn } from "@/utils";
import { DependencyWrapperProps } from "shared-types";
const Checkbox = React.forwardRef<
  React.ElementRef<typeof CheckboxPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root> &
    DependencyWrapperProps & {
      className?: string;
      label: string;
      value?: string;
      styledLabel?: React.ReactNode;
      description?: string;
      optionlabelClassName?: string;
    }
>(({ className, ...props }, ref) => {
  return (
    <div className="items-top flex space-x-2">
      <CheckboxPrimitive.Root
        ref={ref}
        id={props.label}
        className={cn(
          "peer h-7 w-7 my-2 shrink-0 border-black border-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=checked]:border-primary data-[state=checked]:text-primary-foreground",
          className,
        )}
        {...props}
      >
        <CheckboxPrimitive.Indicator
          className={cn("flex items-center justify-center text-white")}
        >
          <Check className="h-4 w-4 stroke-[6px]" />
        </CheckboxPrimitive.Indicator>
      </CheckboxPrimitive.Root>
      <div className="grid gap-1.5 leading-none">
        {!!(props.label || props.styledLabel) && (
          <label
            htmlFor={props.label ?? props.styledLabel}
            className={cn(
              "mt-2 text-md font-normal leading-normal peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
              props.optionlabelClassName,
            )}
          >
            {props.styledLabel ?? props.label}
          </label>
        )}
        {!!props.description && (
          <p className="text-sm text-muted-foreground">{props.description}</p>
        )}
      </div>
    </div>
  );
});
Checkbox.displayName = CheckboxPrimitive.Root.displayName;

export const CheckboxGroup: React.FC<{
  value: string[];
  onChange: (value: string[]) => void;
  options: { label: string; value: string }[];
}> = (props) => {
  return (
    <div className="flex flex-col gap-2">
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
