import * as React from "react";
import { XIcon } from "lucide-react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const chipVariants = cva(
  "inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 whitespace-nowrap",
  {
    variants: {
      variant: {
        default: "bg-primary text-slate-50 hover:bg-primary/90",
        function: "bg-slate-300 hover:bg-primary/90 hover:text-slate-50",
        noIcon: "bg-primary text-slate-50 hover:bg-primary/90",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface ChipProps extends VariantProps<typeof chipVariants> {
  className?: string;
  onChipClick?: () => void;
  onIconClick?: () => void;
}

const Chip = ({
  className,
  onChipClick,
  onIconClick,
  variant,
  ...props
}: React.PropsWithChildren<ChipProps>) => {
  return (
    <div
      className={cn(chipVariants({ variant, className }), "h-8 py-2")}
      {...props}
    >
      <button
        onClick={onChipClick}
        className={variant === "noIcon" ? "px-2" : "pl-2 pr-1"}
      >
        {props.children}
      </button>
      {variant !== "noIcon" && (
        <button
          onClick={onIconClick}
          className="p-1 m-1 hover:bg-slate-300 rounded-md justify-center items-center transition-colors"
        >
          <XIcon className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};

Chip.displayName = "Chip";

export { Chip, chipVariants };
