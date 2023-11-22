import * as React from "react";

import { cn } from "@/lib/utils";

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  charcount?: "simple" | "limited";
  charcountstyling?: string;
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => {
    const strLn = (typeof props?.value === "string" && props.value.length) || 0;
    return (
      <>
        <textarea
          className={cn(
            "flex min-h-[60px] w-full rounded-sm border border-black bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
            className
          )}
          ref={ref}
          {...props}
        />
        {props.charcount && (
          <p
            className={cn(
              "text-right text-gray-500 pr-2 text-sm",
              props.charcountstyling
            )}
          >{`${strLn}${
            props.maxLength && props.charcount === "limited"
              ? `/${props.maxLength}`
              : ""
          }`}</p>
        )}
      </>
    );
  }
);
Textarea.displayName = "Textarea";

export { Textarea };
