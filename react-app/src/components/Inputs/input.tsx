import * as React from "react";
import { cn } from "@/utils";
import { InputProps } from "shared-types";

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, icon, iconRight, ...props }, ref) => {
    return (
      <div className={cn("relative", icon && !className?.includes("w-full") && "w-fit")}>
        {icon && (
          <span
            className={`absolute inset-y-0 border-[#212121] border flex items-center px-3 bg-[#f0f0f0] ${
              iconRight
                ? "right-0 border-s-black rounded-e-sm"
                : "left-0 border-e-black rounded-s-sm"
            }`}
          >
            {icon}
          </span>
        )}
        <input
          className={cn(
            "flex h-9 w-full rounded-sm border border-[#212121] bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
            className,
            icon && (iconRight ? "pr-10" : "pl-10"),
          )}
          ref={ref}
          id={props.name}
          {...props}
        />
      </div>
    );
  },
);

Input.displayName = "Input";

export { Input };
