import * as React from "react";
import { cn } from "@/lib/utils";
import { InputProps } from "shared-types";

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, icon, ...props }, ref) => {
    return (
      <div className="relative">
        {icon && (
          <span className="absolute inset-y-0 left-0 flex items-center pl-2 text-gray-500">
            {icon}
          </span>
        )}
        <input
          className={cn(
            "flex h-9 w-full rounded-sm border border-black bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
            icon && "pl-6",
            className
          )}
          ref={ref}
          id={props.name}
          {...props}
        />
      </div>
    );
  }
);

Input.displayName = "Input";

export { Input };
