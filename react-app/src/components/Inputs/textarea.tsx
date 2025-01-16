import * as React from "react";
import { cn } from "@/utils";
import { TextareaProps } from "shared-types";

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => {
    const strLn = (typeof props?.value === "string" && props.value.length) || 0;
    return (
      <>
        <textarea
          className={cn(
            "flex min-h-[76px] w-full rounded-sm border border-black bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
            className,
          )}
          ref={ref}
          {...props}
        />
        {props.charCount && (
          <p
            className={cn("text-right text-gray-500 pr-2 text-sm", props.charCountClassName)}
          >{`${strLn}${
            props.maxLength && props.charCount === "limited" ? `/${props.maxLength}` : ""
          }`}</p>
        )}
      </>
    );
  },
);
Textarea.displayName = "Textarea";

export { Textarea };
